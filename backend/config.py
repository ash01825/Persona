"""Application settings loaded from .env file."""
from dotenv import load_dotenv
load_dotenv()

from pydantic_settings import BaseSettings  # noqa: E402


class Settings(BaseSettings):
    """Typed application configuration from environment variables."""

    # LLM
    llm_provider: str = "gemini"
    llm_model: str = "gemini/gemini-2.0-flash"
    llm_api_key: str = ""
    llm_instructor_mode: str = "json_mode"
    structured_output_framework: str = "instructor"

    # Embedding
    embedding_provider: str = ""
    embedding_endpoint: str = ""
    embedding_model: str = ""
    embedding_api_key: str = ""
    embedding_dimensions: int = 2048

    # PostgreSQL
    db_provider: str = "postgres"
    db_host: str = "localhost"
    db_port: int = 5433
    db_user: str = "persona"
    db_password: str = "persona"
    db_name: str = "persona"

    # Neo4j
    graph_database_provider: str = "neo4j"
    graph_database_url: str = "bolt://localhost:7687"
    graph_database_username: str = "neo4j"
    graph_database_password: str = "persona1"

    # App
    frontend_url: str = "http://localhost:3000"

    class Config:
        """Pydantic settings config."""

        env_file = ".env"
        extra = "ignore"


settings = Settings()
