from app.config import normalize_database_url


def test_render_postgresql_url_uses_psycopg_v3():
    assert normalize_database_url("postgresql://user:pass@db.example/app") == (
        "postgresql+psycopg://user:pass@db.example/app"
    )


def test_legacy_postgres_url_uses_psycopg_v3():
    assert normalize_database_url("postgres://user:pass@db.example/app") == (
        "postgresql+psycopg://user:pass@db.example/app"
    )


def test_sqlite_url_is_unchanged():
    assert normalize_database_url("sqlite:///calorie_compass.db") == (
        "sqlite:///calorie_compass.db"
    )
