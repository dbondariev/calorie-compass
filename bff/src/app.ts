import { randomUUID } from "node:crypto";
import { join } from "node:path";

import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { isMalformedJson, UpstreamError } from "./errors.js";
import {
  isCalculationHistory,
  isCalculationResponse,
  validateCalculation,
} from "./validation.js";

interface AppOptions {
  backendUrl?: string;
  allowedOrigins?: string[];
  fetchImpl?: typeof globalThis.fetch;
  requestTimeoutMs?: number;
  staticDirectory?: string;
  trustProxy?: number | string | boolean;
}

const parseJson = async (response: globalThis.Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new UpstreamError(
      "The backend returned an unreadable response.",
      "upstream_contract_error",
    );
  }
};

const isValidSuccessBody = (request: Request, body: unknown): boolean => {
  if (request.method === "POST" && request.path === "/api/calculations") {
    return isCalculationResponse(body);
  }
  if (request.method === "GET" && request.path === "/api/calculations") {
    return isCalculationHistory(body);
  }
  return true;
};

export function createApp(options: AppOptions = {}) {
  const {
    backendUrl = "http://localhost:5001",
    allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"],
    fetchImpl = globalThis.fetch,
    requestTimeoutMs = 5_000,
    staticDirectory,
    trustProxy,
  } = options;
  const app = express();

  app.disable("x-powered-by");
  if (trustProxy !== undefined) app.set("trust proxy", trustProxy);
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins }));
  app.use((request, response, next) => {
    const requestId = request.header("x-request-id") ?? randomUUID();
    response.setHeader("x-request-id", requestId);
    response.locals.requestId = requestId;
    next();
  });
  app.use("/api", rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    validate: { forwardedHeader: false },
  }));
  app.use(express.json({ limit: "32kb", strict: true }));
  app.use(morgan("tiny"));

  const proxy = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const internalPath = request.path.replace(/^\/api/, "");
      const query = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
      const upstream = await fetchImpl(`${backendUrl}/api/v1${internalPath}${query}`, {
        method: request.method,
        headers: request.method === "GET" || request.method === "DELETE"
          ? undefined
          : { "content-type": "application/json" },
        body: request.method === "GET" || request.method === "DELETE"
          ? undefined
          : JSON.stringify(request.body),
        signal: AbortSignal.timeout(requestTimeoutMs),
      });

      if (upstream.status === 204) {
        if (request.method !== "DELETE") {
          throw new UpstreamError(
            "The backend response did not match the API contract.",
            "upstream_contract_error",
          );
        }
        response.status(204).end();
        return;
      }

      const body = await parseJson(upstream);
      if (upstream.ok && !isValidSuccessBody(request, body)) {
        throw new UpstreamError(
          "The backend response did not match the API contract.",
          "upstream_contract_error",
        );
      }
      response.status(upstream.status).json(body);
    } catch (error) {
      if (error instanceof UpstreamError) {
        next(error);
        return;
      }
      next(new UpstreamError(
        "The calculation service is temporarily unavailable.",
        "upstream_unavailable",
      ));
    }
  };

  app.get("/api/health", (_request, response) => {
    response.json({ service: "bff", status: "ok" });
  });
  app.get("/api/calculations", proxy);
  app.delete("/api/calculations/:calculationId", (request, response, next) => {
    const calculationId = Number(request.params.calculationId);
    if (!Number.isSafeInteger(calculationId) || calculationId < 1) {
      response.status(400).json({
        error: "validation_error",
        message: "Invalid calculation ID.",
      });
      return;
    }
    void proxy(request, response, next);
  });
  app.post("/api/calculations", (request, response, next) => {
    const validation = validateCalculation(request.body);
    if (!validation.valid) {
      response.status(400).json({
        error: "validation_error",
        message: "One or more fields are invalid.",
        details: validation.errors,
      });
      return;
    }
    void proxy(request, response, next);
  });

  if (staticDirectory) {
    app.use(express.static(staticDirectory, { index: false, maxAge: "1d" }));
    app.use((request, response, next) => {
      if (["GET", "HEAD"].includes(request.method) && !request.path.startsWith("/api/")) {
        response.sendFile(join(staticDirectory, "index.html"));
        return;
      }
      next();
    });
  }

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ error: "not_found", message: "Resource not found." });
  });

  app.use((error: unknown, request: Request, response: Response, _next: NextFunction) => {
    if (isMalformedJson(error)) {
      response.status(400).json({
        error: "malformed_json",
        message: "Request body must contain valid JSON.",
      });
      return;
    }

    const upstreamError = error instanceof UpstreamError
      ? error
      : new UpstreamError("An unexpected BFF error occurred.", "upstream_unavailable");
    console.error(`[${String(response.locals.requestId)}]`, request.method, request.path, error);
    response.status(502).json({ error: upstreamError.code, message: upstreamError.message });
  });

  return app;
}
