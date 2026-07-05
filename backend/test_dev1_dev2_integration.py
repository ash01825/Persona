import os
import json
import asyncio
import warnings
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv()

from cognee_layer.pipeline import run_ingestion_pipeline
from config import settings
import cognee

os.environ["COGNEE_SKIP_CONNECTION_TEST"] = "true"

# Cognee auto-reads EMBEDDING_ENDPOINT from .env. 
# We must delete it from the environment if we are using Gemini, 
# otherwise LiteLLM sends the Gemini request to Jina's URL.
if settings.embedding_provider == "gemini" and "EMBEDDING_ENDPOINT" in os.environ:
    del os.environ["EMBEDDING_ENDPOINT"]

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
    "embedding_endpoint": None, # Forcefully clear whatever was loaded from .env
}
if settings.embedding_provider != "gemini" and settings.embedding_endpoint:
    embedding_config["embedding_endpoint"] = settings.embedding_endpoint

cognee.config.set_embedding_config(embedding_config)

cognee.config.set_relational_db_config({
    "db_provider": settings.db_provider,
    "db_host": settings.db_host,
    "db_port": settings.db_port,
    "db_name": settings.db_name,
    "db_username": settings.db_user,
    "db_password": settings.db_password,
})

cognee.config.set_graph_db_config({
    "graph_database_provider": settings.graph_database_provider,
    "graph_database_url": settings.graph_database_url,
    "graph_database_username": settings.graph_database_username,
    "graph_database_password": settings.graph_database_password,
})

async def main():
    print("Loading chunks extracted by Source Agent (Dev 2)...")
    chunks_path = "/Users/ash/Desktop/30June/backend/einstein_test_chunks.json"
    
    with open(chunks_path, "r") as f:
        all_chunks = json.load(f)
        
    print(f"Loaded {len(all_chunks)} total chunks.")
    
    # We will test just the first 3 chunks to evaluate the extraction quality
    # without hitting API rate limits or waiting 10 minutes.
    test_chunks = all_chunks[:3]
    
    print("\nStarting Dev 1 Ingestion Pipeline on 3 chunks...")
    print("This will pass the text to the LLM to extract Concepts, Beliefs, Creations, etc.")
    
    # Run the ingestion pipeline (this saves to Cognee)
    await run_ingestion_pipeline(test_chunks, mind_id="einstein_test")
    
    print("\n✅ Ingestion complete! The DataPoints have been extracted and saved to Cognee (Postgres + Neo4j).")
    print("Check the terminal logs above to see exactly what nodes and relationships were extracted.")

if __name__ == "__main__":
    asyncio.run(main())
