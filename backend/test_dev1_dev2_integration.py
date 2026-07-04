import os
import json
import asyncio
import warnings
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv()

from cognee_layer.pipeline import run_ingestion_pipeline

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
