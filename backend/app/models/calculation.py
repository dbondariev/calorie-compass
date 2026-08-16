"""Database model for an immutable calorie calculation."""

from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..extensions import db


class Calculation(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    sex: Mapped[str] = mapped_column(String(10), nullable=False)
    height_cm: Mapped[float] = mapped_column(Float, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    activity_level: Mapped[str] = mapped_column(String(20), nullable=False)
    goal: Mapped[str] = mapped_column(String(10), nullable=False)
    bmi: Mapped[float] = mapped_column(Float, nullable=False)
    bmi_category: Mapped[str] = mapped_column(String(20), nullable=False)
    bmr: Mapped[int] = mapped_column(Integer, nullable=False)
    maintenance_calories: Mapped[int] = mapped_column(Integer, nullable=False)
    target_calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    fat_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    carb_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    def to_dict(self, *, include_inputs: bool = False) -> dict:
        created_at = self.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        result = {
            "id": self.id,
            "bmi": self.bmi,
            "bmiCategory": self.bmi_category,
            "bmr": self.bmr,
            "maintenanceCalories": self.maintenance_calories,
            "targetCalories": self.target_calories,
            "macros": {
                "proteinGrams": self.protein_grams,
                "fatGrams": self.fat_grams,
                "carbGrams": self.carb_grams,
            },
            "createdAt": created_at.isoformat().replace("+00:00", "Z"),
        }
        if include_inputs:
            result["inputs"] = {
                "age": self.age,
                "sex": self.sex,
                "heightCm": self.height_cm,
                "weightKg": self.weight_kg,
                "activityLevel": self.activity_level,
                "goal": self.goal,
            }
        return result
