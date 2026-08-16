import "dotenv/config";

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? process.env.BFF_PORT ?? 3001);
const configuredBackendUrl = process.env.BACKEND_URL ?? "http://localhost:5001";
const backendUrl = configuredBackendUrl.includes("://")
  ? configuredBackendUrl
  : `http://${configuredBackendUrl}`;
const configuredTimeout = Number(process.env.REQUEST_TIMEOUT_MS ?? 5_000);
const requestTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
  ? configuredTimeout
  : 5_000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const productionAssets = fileURLToPath(new URL("../../frontend/dist", import.meta.url));
const staticDirectory = process.env.NODE_ENV === "production" && existsSync(productionAssets)
  ? productionAssets
  : undefined;

const server = createApp({
  backendUrl,
  allowedOrigins,
  requestTimeoutMs,
  staticDirectory,
}).listen(port, () => {
  console.log(`BFF listening on http://localhost:${port}`);
  void fetch(`${backendUrl}/api/v1/health`, {
    signal: AbortSignal.timeout(requestTimeoutMs),
  }).then((response) => {
    if (!response.ok) console.warn("Backend warm-up returned", response.status);
  }).catch(() => {
    console.warn("Backend warm-up did not complete; requests will retry normally.");
  });
});

const shutdown = (signal: string) => {
  console.log(`${signal} received; closing BFF.`);
  server.close((error) => {
    process.exitCode = error ? 1 : 0;
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
