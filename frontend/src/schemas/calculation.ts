import { z } from "zod";

export const calculationSchema = z.object({
  age: z.coerce.number().int("Use a whole number").min(14, "Minimum age is 14").max(100, "Maximum age is 100"),
  sex: z.enum(["female", "male"], { message: "Select your sex" }),
  heightCm: z.coerce.number().min(120, "Minimum height is 120 cm").max(230, "Maximum height is 230 cm"),
  weightKg: z.coerce.number().min(35, "Minimum weight is 35 kg").max(300, "Maximum weight is 300 kg"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], { message: "Select an activity level" }),
  goal: z.enum(["lose", "maintain", "gain"], { message: "Select a goal" }),
});

export type CalculationForm = z.infer<typeof calculationSchema>;
