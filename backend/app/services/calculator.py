"""Calorie calculation domain service.

Uses the Mifflin-St Jeor equation. Results are estimates for educational use,
not medical advice.
"""

import logging
from abc import ABC, abstractmethod
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from functools import wraps
from time import perf_counter

from ..schemas import CalculationInput

ACTIVITY_FACTORS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}
GOAL_ADJUSTMENTS = {"lose": -400, "maintain": 0, "gain": 300}

logger = logging.getLogger(__name__)


def timed[T](operation: Callable[..., T]) -> Callable[..., T]:
    """Decorator that records service execution time in debug logs."""

    @wraps(operation)
    def wrapper(*args, **kwargs) -> T:
        started = perf_counter()
        try:
            return operation(*args, **kwargs)
        finally:
            logger.debug(
                "%s completed in %.2fms", operation.__name__, (perf_counter() - started) * 1000
            )

    return wrapper


@dataclass(frozen=True)
class NutritionTargets:
    bmi: float
    bmi_category: str
    bmr: int
    maintenance_calories: int
    target_calories: int
    protein_grams: int
    fat_grams: int
    carb_grams: int


class CalorieCalculator(ABC):
    """Base calculator demonstrating encapsulated domain behavior."""

    @staticmethod
    def bmi_category(bmi: float) -> str:
        if bmi < 18.5:
            return "Underweight"
        if bmi < 25:
            return "Healthy"
        if bmi < 30:
            return "Overweight"
        return "Obesity"

    @staticmethod
    def macro_items(target: int, weight_kg: float) -> Iterator[tuple[str, int]]:
        # Cap weight-based targets so macro calories can never exceed the target.
        protein = round(min(weight_kg * 1.8, target * 0.35 / 4))
        fat = round(min(weight_kg * 0.8, target * 0.35 / 9))
        carbs = max(0, round((target - protein * 4 - fat * 9) / 4))
        yield "protein_grams", protein
        yield "fat_grams", fat
        yield "carb_grams", carbs

    @abstractmethod
    def _bmr(self, data: CalculationInput) -> float:
        """Return basal metabolic rate for a validated profile."""

    @timed
    def calculate(self, data: CalculationInput) -> NutritionTargets:
        height_m = data.height_cm / 100
        bmi = round(data.weight_kg / (height_m**2), 1)
        raw_bmr = self._bmr(data)
        bmr = round(raw_bmr)
        maintenance = round(raw_bmr * ACTIVITY_FACTORS[data.activity_level])
        target = max(1200, maintenance + GOAL_ADJUSTMENTS[data.goal])
        macros = dict(self.macro_items(target, data.weight_kg))
        return NutritionTargets(
            bmi=bmi,
            bmi_category=self.bmi_category(bmi),
            bmr=bmr,
            maintenance_calories=maintenance,
            target_calories=target,
            **macros,
        )


class MifflinStJeorCalculator(CalorieCalculator):
    """Concrete calculator using sex-specific Mifflin-St Jeor constants."""

    def _bmr(self, data: CalculationInput) -> float:
        base = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age
        return base + (5 if data.sex == "male" else -161)
