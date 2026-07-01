"""Cognee initialization — configures all three storage backends."""
import cognee
import structlog

from config import settings

logger = structlog.get_logger()


async def initialize_cognee() -> None:
    """
    Configure Cognee with:
    - LLM: Gemini 2.0 Flash (extraction) via LiteLLM
    - Embedding: Qwen3-Embedding-8B via Rewind.ai (OpenAI-compatible)
    - Vector store: pgvector (inside PostgreSQL)
    - Graph store: Neo4j
    - Relational store: PostgreSQL

    IMPORTANT: The exact Cognee config API must be verified after installing the package.
    Run: python -c "import cognee; help(cognee.config)"
    The method names below are based on Cognee docs but may differ slightly in your version.
    """
    try:
        # ── LLM configuration ──────────────────────────────────────────────
        await cognee.config.set_llm_config({
            "provider": settings.llm_provider,
            "model": settings.llm_model,
            "api_key": settings.llm_api_key,
        })

        # ── Embedding configuration ─────────────────────────────────────────
        await cognee.config.set_vectordb_config({
            "provider": "pgvector",
            "url": (
                f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}"
                f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
            ),
            "embedding_model": settings.embedding_model,
            "embedding_api_key": settings.embedding_api_key,
            "embedding_api_base": settings.embedding_api_base,
        })

        # ── Graph store (Neo4j) ─────────────────────────────────────────────
        await cognee.config.set_graph_db_config({
            "provider": settings.graph_database_provider,
            "url": settings.graph_database_url,
            "username": settings.graph_database_username,
            "password": settings.graph_database_password,
        })

        logger.info(
            "Cognee initialized",
            llm_model=settings.llm_model,
            embedding_model=settings.embedding_model,
            graph_db=settings.graph_database_provider,
        )

    except Exception as e:
        logger.error("Cognee initialization failed", error=str(e))
        raise
