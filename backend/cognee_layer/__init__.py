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

    Cognee 1.2.2 field naming: all config dict keys use prefixed names
    (llm_provider not provider, vector_db_provider not provider, etc.)
    """
    try:
        # ── LLM configuration ──────────────────────────────────────────────
        cognee.config.set_llm_config({
            "llm_provider": settings.llm_provider,
            "llm_model": settings.llm_model,
            "llm_api_key": settings.llm_api_key,
        })

        # ── Embedding configuration ─────────────────────────────────────────
        cognee.config.set_embedding_config({
            "embedding_model": settings.embedding_model,
            "embedding_endpoint": settings.embedding_api_base,
            "embedding_api_key": settings.embedding_api_key,
        })

        # ── Vector store (pgvector) ─────────────────────────────────────────
        cognee.config.set_vector_db_config({
            "vector_db_provider": "pgvector",
            "vector_db_url": (
                f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}"
                f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
            ),
        })

        # ── Graph store (Neo4j) ─────────────────────────────────────────────
        cognee.config.set_graph_db_config({
            "graph_database_provider": settings.graph_database_provider,
            "graph_database_url": settings.graph_database_url,
            "graph_database_username": settings.graph_database_username,
            "graph_database_password": settings.graph_database_password,
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
