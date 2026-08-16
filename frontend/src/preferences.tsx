import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

export type Locale = "en" | "uk";
export type UnitSystem = "metric" | "imperial";

const en = {
  nutritionPractical: "Nutrition made practical",
  heroTitle: "Know what fuels you.",
  heroBody: "A clear daily calorie and macro estimate—built around your body, routine and goal.",
  language: "Language",
  units: "Units",
  english: "English",
  ukrainian: "Ukrainian",
  metric: "Metric",
  imperial: "Imperial",
  dailyTarget: "Your daily target",
  formIntro: "Add your details for a science-based daily estimate.",
  sexFormula: "Sex used in the BMR formula",
  female: "Female",
  male: "Male",
  age: "Age",
  height: "Height",
  weight: "Weight",
  feet: "Feet",
  inches: "Inches",
  ageRange: "14–100 years",
  metricHeightRange: "120–230 cm",
  imperialHeightRange: "3 ft 11 in–7 ft 7 in",
  metricWeightRange: "35–300 kg",
  imperialWeightRange: "77–661 lb",
  activityLevel: "Activity level",
  sedentary: "Sedentary · little or no exercise",
  light: "Light · 1–3 workouts/week",
  moderate: "Moderate · 3–5 workouts/week",
  active: "Active · 6–7 workouts/week",
  veryActive: "Very active · intense daily training",
  goal: "Goal",
  lose: "Lose",
  maintain: "Maintain",
  gain: "Gain",
  calculating: "Calculating…",
  calculate: "Calculate my target",
  disclaimer: "Educational estimate only. Consult a qualified professional for medical nutrition advice.",
  resultPlaceholder: "Your result will appear here",
  resultPlaceholderBody: "Complete the form to see calories, BMI, metabolism and daily macros.",
  calorieTarget: "Daily calorie target",
  targetDescription: "A practical daily target based on your goal.",
  maintenance: "Maintenance",
  metabolism: "Base metabolism",
  suggestedMacros: "Suggested daily macros",
  protein: "Protein",
  fat: "Fat",
  carbs: "Carbs",
  recent: "Recent calculations",
  retry: "Retry",
  emptyHistory: "No saved calculations yet.",
  deleteCalculation: "Delete calculation",
  deleted: "Calculation deleted.",
  historyLoadError: "Could not load calculation history.",
  calculateError: "Unable to calculate right now.",
  deleteError: "Could not delete the calculation.",
  serviceUnavailable: "The calculation service is temporarily unavailable. Please try again.",
  requestTimeout: "The request took too long. Please try again.",
  networkError: "Cannot reach the service. Check your connection and try again.",
  underweight: "Underweight",
  healthy: "Healthy",
  overweight: "Overweight",
  obesity: "Obesity",
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
} as const;

const uk: Record<keyof typeof en, string> = {
  nutritionPractical: "Практичне харчування",
  heroTitle: "Знайте, що живить ваше тіло.",
  heroBody: "Зрозумілий розрахунок калорій і макронутрієнтів з урахуванням вашого тіла, активності та мети.",
  language: "Мова",
  units: "Одиниці",
  english: "Англійська",
  ukrainian: "Українська",
  metric: "Метричні",
  imperial: "Імперські",
  dailyTarget: "Ваша денна норма",
  formIntro: "Вкажіть свої дані для науково обґрунтованого розрахунку.",
  sexFormula: "Стать для формули BMR",
  female: "Жінка",
  male: "Чоловік",
  age: "Вік",
  height: "Зріст",
  weight: "Вага",
  feet: "Фути",
  inches: "Дюйми",
  ageRange: "14–100 років",
  metricHeightRange: "120–230 см",
  imperialHeightRange: "3 фт 11 дюйм–7 фт 7 дюйм",
  metricWeightRange: "35–300 кг",
  imperialWeightRange: "77–661 фунт",
  activityLevel: "Рівень активності",
  sedentary: "Малорухливий · мало або без тренувань",
  light: "Легкий · 1–3 тренування на тиждень",
  moderate: "Помірний · 3–5 тренувань на тиждень",
  active: "Активний · 6–7 тренувань на тиждень",
  veryActive: "Дуже активний · інтенсивні щоденні тренування",
  goal: "Мета",
  lose: "Схуднути",
  maintain: "Підтримувати",
  gain: "Набрати",
  calculating: "Розрахунок…",
  calculate: "Розрахувати норму",
  disclaimer: "Лише освітня оцінка. Для медичної консультації з харчування зверніться до кваліфікованого фахівця.",
  resultPlaceholder: "Тут з’явиться ваш результат",
  resultPlaceholderBody: "Заповніть форму, щоб побачити калорії, BMI, метаболізм і денні макронутрієнти.",
  calorieTarget: "Денна норма калорій",
  targetDescription: "Практична денна норма відповідно до вашої мети.",
  maintenance: "Підтримка ваги",
  metabolism: "Базовий метаболізм",
  suggestedMacros: "Рекомендовані денні макронутрієнти",
  protein: "Білки",
  fat: "Жири",
  carbs: "Вуглеводи",
  recent: "Останні розрахунки",
  retry: "Повторити",
  emptyHistory: "Збережених розрахунків ще немає.",
  deleteCalculation: "Видалити розрахунок",
  deleted: "Розрахунок видалено.",
  historyLoadError: "Не вдалося завантажити історію розрахунків.",
  calculateError: "Наразі не вдалося виконати розрахунок.",
  deleteError: "Не вдалося видалити розрахунок.",
  serviceUnavailable: "Сервіс розрахунків тимчасово недоступний. Спробуйте ще раз.",
  requestTimeout: "Запит тривав надто довго. Спробуйте ще раз.",
  networkError: "Не вдалося з’єднатися із сервісом. Перевірте підключення та спробуйте ще раз.",
  underweight: "Недостатня вага",
  healthy: "Здорова вага",
  overweight: "Надмірна вага",
  obesity: "Ожиріння",
  wholeNumber: "Використовуйте ціле число",
  minAge: "Мінімальний вік — 14 років",
  maxAge: "Максимальний вік — 100 років",
  selectSex: "Оберіть стать",
  minHeight: "Мінімальний зріст — 120 см",
  maxHeight: "Максимальний зріст — 230 см",
  minWeight: "Мінімальна вага — 35 кг",
  maxWeight: "Максимальна вага — 300 кг",
  selectActivity: "Оберіть рівень активності",
  selectGoal: "Оберіть мету",
};

export type TranslationKey = keyof typeof en;

interface PreferencesValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

const stored = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const value = localStorage.getItem(key) as T | null;
  return value && allowed.includes(value) ? value : fallback;
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(() => stored("calorie-locale", ["en", "uk"], "en"));
  const [units, updateUnits] = useState<UnitSystem>(() => stored("calorie-units", ["metric", "imperial"], "metric"));

  const value = useMemo<PreferencesValue>(() => ({
    locale,
    setLocale: (next) => { localStorage.setItem("calorie-locale", next); updateLocale(next); },
    units,
    setUnits: (next) => { localStorage.setItem("calorie-units", next); updateUnits(next); },
    t: (key) => (locale === "uk" ? uk : en)[key],
  }), [locale, units]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

// The provider and its consumer hook intentionally share one context module.
// oxlint-disable-next-line react/only-export-components
export function usePreferences(): PreferencesValue {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
