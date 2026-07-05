import os
import sys
import asyncio
import warnings
import structlog
from dotenv import load_dotenv

# Suppress litellm/pydantic warnings
warnings.filterwarnings("ignore")
load_dotenv()

from agents.source_agent import SourceGatheringAgent
from cognee_layer.chunker import chunk_document
from cognee_layer.pipeline import run_ingestion_pipeline
from config import settings
import cognee

import os
# Set Cognee configs manually as required by Cognee 1.2.2
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
# Only pass the custom endpoint if we are not using native Gemini
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


logger = structlog.get_logger()

# Our master search missions to find everything
MISSIONS = [
    "{person_name} personal letters diary correspondence archive text",
    "{person_name} original patents inventions documentation text",
    "{person_name} original papers autobiography book pdf transcript",
    "{person_name} speech transcripts interviews quotes direct"
]

async def build_mind(person_name: str, top_n_sources: int = 10):
    """
    Two-Phase Architecture:
    Phase 1: Gather a massive pool of sources and score them 1-100.
    Phase 2: Pick the Top N best sources overall and ingest them.
    """
    logger.info(f"🚀 Kicking off full Brain Extraction for {person_name}")
    agent = SourceGatheringAgent()
    mind_id = person_name.lower().replace(" ", "_")
    
    # ─── PHASE 1: RECON & RANKING ───
    logger.info("🔍 PHASE 1: Starting Recon & Ranking")
    source_pool = []
    
    for idx, mission_template in enumerate(MISSIONS):
        query = mission_template.format(person_name=person_name)
        logger.info(f"\n=============================================")
        logger.info(f" MISSION {idx+1}/{len(MISSIONS)}: {query}")
        logger.info(f"=============================================")
        
        try:
            # Gather up to 30 potential sources per mission to build a massive pool
            async for valid_source in agent.gather_sources(person_name, query=query, max_sources=30):
                source_pool.append(valid_source)
        except Exception as e:
            logger.error(f"Critical error during mission {idx+1}: {e}")
            continue

    if not source_pool:
        logger.error("❌ No valid sources found across any mission. Aborting.")
        return

    # Sort the pool by the LLM's relevance score (highest first)
    source_pool.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    
    logger.info(f"🏆 PHASE 1 COMPLETE. Built a pool of {len(source_pool)} valid historical sources.")
    for i, s in enumerate(source_pool):
        logger.info(f"   #{i+1} [Score: {s.get('relevance_score')}] {s['title']}")

    # ─── PHASE 2: INGESTION ───
    # Slice the top N sources
    selected_sources = source_pool[:top_n_sources]
    logger.info(f"\n🧠 PHASE 2: Ingesting the Top {len(selected_sources)} absolute best sources...")
    
    total_sources_ingested = 0
    total_chunks_ingested = 0

    for source in selected_sources:
        logger.info(f"📥 Processing top source: {source['title']}")
        chunks = chunk_document(
            text=source["content"],
            title=source["title"],
            source_type=source["source_type"],
            person_name=person_name
        )
        logger.info(f"✂️ Sliced into {len(chunks)} chunks.")
        
        if chunks:
            logger.info(f"🧠 Passing {len(chunks)} chunks to Cognee Extraction Pipeline...")
            try:
                await run_ingestion_pipeline(chunks, mind_id=mind_id)
                total_sources_ingested += 1
                total_chunks_ingested += len(chunks)
                logger.info(f"✅ Ingestion complete. Progress: {total_sources_ingested}/{len(selected_sources)}")
            except Exception as e:
                logger.error(f"❌ Failed to ingest chunks for {source['title']}: {e}")
                
    logger.info(f"\n🎉 MIND BUILD COMPLETE FOR {person_name} 🎉")
    logger.info(f"Ingested {total_sources_ingested} sources across {total_chunks_ingested} chunks.")
    logger.info("The knowledge graph is now safely stored in Neo4j and Postgres.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python build_mind.py \"Person Name\" [sources_per_mission]")
        sys.exit(1)
        
    name = sys.argv[1]
    top_n_sources = 10
    if len(sys.argv) > 2:
        top_n_sources = int(sys.argv[2])
        
    asyncio.run(build_mind(name, top_n_sources))
