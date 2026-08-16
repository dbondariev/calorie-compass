"""Boundary validation models matching the shared JSON contract."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CalculationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    age: int = Field(ge=14, le=100)
    sex: Literal["female", "male"]
    height_cm: float = Field(alias="heightCm", ge=120, le=230)
    weight_kg: float = Field(alias="weightKg", ge=35, le=300)
    activity_level: Literal[
        "sedentary", "light", "moderate", "active", "very_active"
    ] = Field(alias="activityLevel")
    goal: Literal["lose", "maintain", "gain"]

