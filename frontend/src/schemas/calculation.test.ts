import { describe, expect, it } from "vitest";

import { calculationSchema } from "./calculation";

const valid = {
  age: 30,
  sex: "female",
  heightCm: 168,
  weightKg: 64,
  activityLevel: "moderate",
  goal: "maintain",
};

describe("calculation form validation", () => {
  it("accepts a complete valid profile", () => {
    expect(calculationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects values outside supported health ranges", () => {
    const result = calculationSchema.safeParse({ ...valid, heightCm: 50, age: 8 });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toHaveLength(2);
  });
});

