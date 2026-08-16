import { z } from "zod";

export interface ValidationMessages {
  wholeNumber: string;
  minAge: string;
  maxAge: string;
  selectSex: string;
  minHeight: string;
  maxHeight: string;
  minWeight: string;
  maxWeight: string;
  selectActivity: string;
  selectGoal: string;
}

const englishMessages: ValidationMessages = {
  wholeNumber: "Use a whole number",
  minAge: "Minimum age is 14",
  maxAge: "Maximum age is 100",
  selectSex: "Select your sex",
  minHeight: "Minimum height is 120 cm",
  maxHeight: "Maximum height is 230 cm",
  minWeight: "Minimum weight is 35 kg",
  maxWeight: "Maximum weight is 300 kg",
  selectActivity: "Select an activity level",
  selectGoal: "Select a goal",
};

export const createCalculationSchema = (messages: ValidationMessages) => z.object({
  age: z.coerce.number().int(messages.wholeNumber).min(14, messages.minAge).max(100, messages.maxAge),
  sex: z.enum(["female", "male"], { message: messages.selectSex }),
  heightCm: z.coerce.number().min(120, messages.minHeight).max(230, messages.maxHeight),
  weightKg: z.coerce.number().min(35, messages.minWeight).max(300, messages.maxWeight),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], { message: messages.selectActivity }),
  goal: z.enum(["lose", "maintain", "gain"], { message: messages.selectGoal }),
});

export const calculationSchema = createCalculationSchema(englishMessages);

export type CalculationForm = z.infer<typeof calculationSchema>;
