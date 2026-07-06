"""Cognee initialization — configures all three storage backends."""
import cognee
import structlog

from config import settings

logger = structlog.get_logger()


async def initialize_cognee() -> None:
    """
    Configure Cognee with:
    - LLM: Gemini 3.1-Flash-Lite (extraction) via Google AI Studios
    - Embedding: jina-embeddings-v4 via Jina
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
        embed_cfg = {
            "embedding_provider": settings.embedding_provider,
            "embedding_model": settings.embedding_model,
            "embedding_api_key": settings.embedding_api_key,
            "embedding_dimensions": settings.embedding_dimensions,
        }
        if settings.embedding_endpoint:
            embed_cfg["embedding_endpoint"] = settings.embedding_endpoint
        elif hasattr(cognee.config, "embedding_endpoint"):
            embed_cfg["embedding_endpoint"] = None

        cognee.config.set_embedding_config(embed_cfg)

        # ── Relational store (PostgreSQL) ───────────────────────────────────
        cognee.config.set_relational_db_config({
            "db_provider": "postgres",
            "db_host": settings.db_host,
            "db_port": settings.db_port,
            "db_name": settings.db_name,
            "db_username": settings.db_user,
            "db_password": settings.db_password,
        })

        # ── Vector store (pgvector) ─────────────────────────────────────────
        # In build_mind.py, vector_db_config was never explicitly set,
        # meaning all embeddings were actually built and stored in the default LanceDB.
        # We must NOT force pgvector here, otherwise chat won't find the collections.
        # cognee.config.set_vector_db_config({
        #     "vector_db_provider": "pgvector",
        #     "vector_db_url": (
        #         f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}"
        #         f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
        #     ),
        # })

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
