import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

import cognee
from config import settings

async def main():
    print("Setting up Cognee config...")
    
    # Sync config setters for Cognee 1.2.2
    cognee.config.set_llm_config({
        "llm_provider": settings.llm_provider,
        "llm_model": settings.llm_model,
        "llm_api_key": settings.llm_api_key,
    })
    
    embedding_config = {
        "embedding_provider": settings.embedding_provider,
        "embedding_model": settings.embedding_model,
        "embedding_api_key": settings.embedding_api_key,
        "embedding_dimensions": settings.embedding_dimensions,
        "embedding_endpoint": settings.embedding_endpoint if settings.embedding_endpoint else None,
    }
    
    cognee.config.set_embedding_config(embedding_config)
    
    cognee.config.set_relational_db_config({
        "db_provider": settings.db_provider,
        "db_host": settings.db_host,
        "db_port": settings.db_port,
        "db_name": settings.db_name,
        "db_username": settings.db_user,
        "db_password": settings.db_password,
    })
    
    cognee.config.set_vector_db_config({
        "vector_db_provider": "pgvector",
        "vector_db_url": f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}",
    })
    
    cognee.config.set_graph_db_config({
        "graph_database_provider": settings.graph_database_provider,
        "graph_database_url": settings.graph_database_url,
        "graph_database_username": settings.graph_database_username,
        "graph_database_password": settings.graph_database_password,
    })
    
    print("Running cognee.improve() on dataset 'persona_albert_einstein'...")
    try:
        result = await cognee.improve(dataset="persona_albert_einstein")
        print("Finished successfully!", result)
    except Exception as e:
        print("Error during improve:", e)

if __name__ == "__main__":
    asyncio.run(main())
