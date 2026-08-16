"""Flask application factory for Calorie Compass."""

from pathlib import Path
from typing import Any

from flask import Flask, jsonify
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

from .config import Config
from .extensions import db, migrate
from .routes import api
from .services.errors import ApiError


def create_app(config: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)
    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    app.register_blueprint(api, url_prefix="/api/v1")

    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError) -> tuple[Any, int]:
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError) -> tuple[Any, int]:
        issues = [
            {"field": ".".join(map(str, item["loc"])), "message": item["msg"]}
            for item in error.errors()
        ]
        return jsonify({
            "error": "validation_error",
            "message": "One or more fields are invalid.",
            "details": issues,
        }), 400

    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException) -> tuple[Any, int]:
        return jsonify({
            "error": error.name.lower().replace(" ", "_"),
            "message": error.description,
        }), error.code or 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception) -> tuple[Any, int]:
        db.session.rollback()
        app.logger.exception("Unhandled backend error", exc_info=error)
        return jsonify({
            "error": "internal_server_error",
            "message": "An unexpected error occurred.",
        }), 500

    @app.teardown_request
    def rollback_failed_transaction(error: BaseException | None) -> None:
        if error is not None:
            db.session.rollback()

    if app.config["AUTO_CREATE_SCHEMA"]:
        with app.app_context():
            db.create_all()

    return app
