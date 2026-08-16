import type { CalculationRequest, CalculationResult } from "../types/calculation";

const API_URL = import.meta.env.VITE_BFF_URL ?? "/api";
// Render's free backend can take up to about a minute to wake after inactivity.
const REQUEST_TIMEOUT_MS = 70_000;

interface ErrorPayload {
  message?: string;
  details?: Array<{ field?: string; message?: string }>;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const errorMessage = (body: ErrorPayload): string => {
  const firstIssue = body.details?.[0];
  if (firstIssue?.message) {
    return `${firstIssue.field && firstIssue.field !== "request" ? `${firstIssue.field}: ` : ""}${firstIssue.message}`;
  }
  return body.message ?? "Something went wrong. Please try again.";
};

async function apiRequest<T>(path: string, init?: RequestInit, attempt = 0): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: init?.body
        ? { "content-type": "application/json", ...init.headers }
        : init?.headers,
      signal: controller.signal,
    });

    const method = init?.method ?? "GET";
    if (method === "GET" && attempt === 0 && [502, 503, 504].includes(response.status)) {
      return apiRequest<T>(path, init, attempt + 1);
    }

    if (response.status === 204) return undefined as T;

    const body = await response.json().catch(() => null) as ErrorPayload | T | null;
    if (!response.ok) {
      throw new ApiError(errorMessage((body ?? {}) as ErrorPayload), response.status);
    }
    if (body === null) {
      throw new ApiError("The server returned an unreadable response.", 502);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request took too long. Please try again.", 408);
    }
    throw new ApiError("Cannot reach the service. Check your connection and try again.", 0);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export const calculationApi = {
  create: (payload: CalculationRequest) =>
    apiRequest<CalculationResult>("/calculations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: () => apiRequest<{ items: CalculationResult[] }>("/calculations?limit=6"),
  remove: (id: number) => apiRequest<void>(`/calculations/${id}`, { method: "DELETE" }),
};
