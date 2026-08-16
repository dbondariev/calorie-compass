from app.schemas import CalculationInput
from app.services.calculator import MifflinStJeorCalculator


def test_known_mifflin_st_jeor_result():
    profile = CalculationInput.model_validate({
        "age": 38,
        "sex": "male",
        "heightCm": 183,
        "weightKg": 100,
        "activityLevel": "light",
        "goal": "maintain",
    })
    result = MifflinStJeorCalculator().calculate(profile)
    assert result.bmr == 1959
    assert result.maintenance_calories == 2693
    assert result.target_calories == 2693


def test_macro_calories_never_exceed_target_for_extreme_weight():
    macros = dict(MifflinStJeorCalculator.macro_items(1200, 300))
    macro_calories = (
        macros["protein_grams"] * 4
        + macros["fat_grams"] * 9
        + macros["carb_grams"] * 4
    )
    assert macro_calories <= 1205  # rounding tolerance
