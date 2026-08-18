from app.config import Settings


def test_plain_postgres_url_uses_installed_psycopg_driver() -> None:
    settings = Settings(database_url="postgresql://user:password@example.com/database")

    assert settings.database_url == "postgresql+psycopg://user:password@example.com/database"
