import { afterEach, describe, expect, it, vi } from "vitest";

import { calculationApi } from "./api";

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

describe("calculation API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns structured response data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ items: [] })));
    await expect(calculationApi.list()).resolves.toEqual({ items: [] });
  });

  it("surfaces backend validation details", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      error: "validation_error",
      message: "One or more fields are invalid.",
      details: [{ field: "age", message: "must be at least 14" }],
    }, 400)));

    await expect(calculationApi.list()).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        status: 400,
        message: "age: must be at least 14",
      }),
    );
  });

  it("supports successful empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(calculationApi.remove(1)).resolves.toBeUndefined();
  });

  it("converts network failures into safe user messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket details")));
    await expect(calculationApi.list()).rejects.toEqual(
      expect.objectContaining({ status: 0, message: expect.not.stringContaining("socket details") }),
    );
  });
});
