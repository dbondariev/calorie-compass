"""Internal REST API consumed only by the BFF."""

from dataclasses import asdict

from flask import Blueprint, jsonify, request
from sqlalchemy import select

from .extensions import db
from .models import Calculation
from .schemas import CalculationInput
from .services import MifflinStJeorCalculator
from .services.errors import ApiError
from .services.persistence import commit_or_raise

api = Blueprint("api", __name__)
calculator = MifflinStJeorCalculator()


@api.get("/health")
def health() -> tuple[dict[str, str], int] | object:
    return jsonify({"status": "ok", "service": "backend"})


@api.post("/calculations")
def create_calculation() -> tuple[object, int]:
    if not request.is_json:
        raise ApiError("Content-Type must be application/json", 415, "unsupported_media_type")

    data = CalculationInput.model_validate(request.get_json())
    result = calculator.calculate(data)
    record = Calculation(
        **data.model_dump(),
        **asdict(result),
    )
    db.session.add(record)
    commit_or_raise()
    return jsonify(record.to_dict()), 201


@api.get("/calculations")
def list_calculations() -> object:
    limit = request.args.get("limit", default=8, type=int)
    limit = min(max(limit or 8, 1), 50)
    records = db.session.scalars(
        select(Calculation).order_by(Calculation.created_at.desc()).limit(limit)
    )
    return jsonify({"items": [record.to_dict(include_inputs=True) for record in records]})


@api.delete("/calculations/<int:calculation_id>")
def delete_calculation(calculation_id: int) -> tuple[str, int]:
    record = db.session.get(Calculation, calculation_id)
    if record is None:
        raise ApiError("Calculation not found", 404, "not_found")
    db.session.delete(record)
    commit_or_raise()
    return "", 204
