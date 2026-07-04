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

logger = structlog.get_logger()

# Our master search missions to find everything
MISSIONS = [
    "{person_name} personal letters diary correspondence archive text",
    "{person_name} original patents inventions documentation text",
    "{person_name} original papers autobiography book pdf transcript",
    "{person_name} speech transcripts interviews quotes direct"
]

async def build_mind(person_name: str, sources_per_mission: int = 5):
    """
    The Master Orchestrator.
    Creates a continuous loop that gathers sources from 4 different missions,
    chunks them, and immediately ingests them into the Graph Database.
    """
    logger.info(f"🚀 Kicking off full Brain Extraction for {person_name}")
    agent = SourceGatheringAgent()
    
    # Format the ID for Cognee
    mind_id = person_name.lower().replace(" ", "_")
    
    total_sources_ingested = 0
    total_chunks_ingested = 0

    for idx, mission_template in enumerate(MISSIONS):
        query = mission_template.format(person_name=person_name)
        logger.info(f"\n=============================================")
        logger.info(f" MISSION {idx+1}/{len(MISSIONS)}: {query}")
        logger.info(f"=============================================")
        
        try:
            # We iterate over the agent as a generator (yielding 1 valid source at a time)
            async for valid_source in agent.gather_sources(person_name, query=query, max_sources=sources_per_mission):
                logger.info(f"📥 Received valid source: {valid_source['title']}")
                
                # 1. Chunk it
                chunks = chunk_document(
                    text=valid_source["content"],
                    title=valid_source["title"],
                    source_type=valid_source["source_type"],
                    person_name=person_name
                )
                logger.info(f"✂️ Sliced into {len(chunks)} chunks.")
                
                # 2. Ingest it (Dev 1 Pipeline)
                if chunks:
                    logger.info(f"🧠 Passing {len(chunks)} chunks to Cognee Extraction Pipeline...")
                    try:
                        # This runs the LLM extraction and saves to Postgres + Neo4j
                        await run_ingestion_pipeline(chunks, mind_id=mind_id)
                        total_sources_ingested += 1
                        total_chunks_ingested += len(chunks)
                        logger.info(f"✅ Successfully ingested source. Progress: {total_sources_ingested} total sources.")
                    except Exception as e:
                        logger.error(f"❌ Failed to ingest chunks for {valid_source['title']}: {e}")
                
        except Exception as e:
            logger.error(f"Critical error during mission {idx+1}: {e}")
            logger.info("Moving to next mission...")
            continue
            
    logger.info(f"\n🎉 MIND BUILD COMPLETE FOR {person_name} 🎉")
    logger.info(f"Ingested {total_sources_ingested} sources across {total_chunks_ingested} chunks.")
    logger.info("The knowledge graph is now safely stored in Neo4j and Postgres.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python build_mind.py \"Person Name\" [sources_per_mission]")
        sys.exit(1)
        
    name = sys.argv[1]
    sources_per_mission = 5
    if len(sys.argv) > 2:
        sources_per_mission = int(sys.argv[2])
        
    asyncio.run(build_mind(name, sources_per_mission))
