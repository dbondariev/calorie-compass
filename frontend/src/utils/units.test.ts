import { describe, expect, it } from "vitest";

import {
  centimetersToInches,
  inchesToCentimeters,
  kilogramsToPounds,
  poundsToKilograms,
  splitHeight,
} from "./units";

describe("unit conversions", () => {
  it("round-trips metric and imperial weight", () => {
    expect(poundsToKilograms(kilogramsToPounds(100))).toBeCloseTo(100, 8);
  });

  it("round-trips metric and imperial height", () => {
    expect(inchesToCentimeters(centimetersToInches(183))).toBeCloseTo(183, 8);
  });

  it("splits centimeters into feet and inches", () => {
    expect(splitHeight(183)).toEqual({ feet: 6, inches: 0 });
  });
});
