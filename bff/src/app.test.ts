import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "./app.js";

const validRequest = {
  age: 30,
  sex: "male",
  heightCm: 180,
  weightKg: 80,
  activityLevel: "moderate",
  goal: "maintain",
};

const validResponse = {
  id: 1,
  bmi: 24.7,
  bmiCategory: "Healthy",
  bmr: 1780,
  maintenanceCalories: 2759,
  targetCalories: 2759,
  macros: { proteinGrams: 144, fatGrams: 64, carbGrams: 402 },
  createdAt: "2026-08-16T10:22:10.283860Z",
};

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

describe("BFF", () => {
  it("rejects invalid input before calling Flask", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const response = await request(createApp({ fetchImpl })).post("/api/calculations").send({ age: 5 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("validation_error");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns structured errors for malformed JSON", async () => {
    const response = await request(createApp())
      .post("/api/calculations")
      .set("content-type", "application/json")
      .send('{"age":');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("malformed_json");
  });

  it("forwards valid input to Flask", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(validResponse, 201));
    const response = await request(createApp({ fetchImpl }))
      .post("/api/calculations")
      .send(validRequest);
    expect(response.status).toBe(201);
    expect(response.body.targetCalories).toBe(2759);
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/calculations",
      expect.objectContaining({ method: "POST" }),
    );
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("rejects a successful response that violates the shared contract", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: 1 }, 201));
    const response = await request(createApp({ fetchImpl }))
      .post("/api/calculations")
      .send(validRequest);
    expect(response.status).toBe(502);
    expect(response.body.error).toBe("upstream_contract_error");
  });

  it("maps network failures to a safe upstream error", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error("connection refused"));
    const response = await request(createApp({ fetchImpl })).get("/api/calculations");
    expect(response.status).toBe(502);
    expect(response.body.error).toBe("upstream_unavailable");
    expect(response.text).not.toContain("connection refused");
  });

  it("reports BFF liveness without depending on Flask", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error("connection refused"));
    const response = await request(createApp({ fetchImpl })).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ service: "bff", status: "ok" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects invalid identifiers without calling Flask", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const response = await request(createApp({ fetchImpl })).delete("/api/calculations/0");
    expect(response.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
