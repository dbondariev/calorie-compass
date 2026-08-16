const INCHES_PER_CENTIMETER = 1 / 2.54;
const POUNDS_PER_KILOGRAM = 2.2046226218;

export const centimetersToInches = (centimeters: number) => centimeters * INCHES_PER_CENTIMETER;
export const inchesToCentimeters = (inches: number) => inches * 2.54;
export const kilogramsToPounds = (kilograms: number) => kilograms * POUNDS_PER_KILOGRAM;
export const poundsToKilograms = (pounds: number) => pounds / POUNDS_PER_KILOGRAM;

export const splitHeight = (centimeters: number) => {
  const totalInches = centimetersToInches(centimeters);
  const feet = Math.floor(totalInches / 12);
  return { feet, inches: Number((totalInches - feet * 12).toFixed(1)) };
};

export const formatImperialHeight = (centimeters: number) => {
  const { feet, inches } = splitHeight(centimeters);
  return `${feet} ft ${inches} in`;
};
