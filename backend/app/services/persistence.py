"""Transaction boundary helpers."""

from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from ..extensions import db
from .errors import ApiError


def commit_or_raise() -> None:
    """Commit atomically and convert database failures to a safe API error."""

    try:
        db.session.commit()
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Database transaction failed")
        raise ApiError(
            "The calculation could not be saved.",
            status_code=503,
            code="persistence_error",
        ) from error
