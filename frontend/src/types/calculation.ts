export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export interface CalculationRequest {
  age: number;
  sex: "female" | "male";
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface CalculationResult {
  id: number;
  bmi: number;
  bmiCategory: string;
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  macros: {
    proteinGrams: number;
    fatGrams: number;
    carbGrams: number;
  };
  createdAt: string;
  inputs?: CalculationRequest;
}

