import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from cognee_layer.graph_analytics import run_theme_clustering

async def main():
    minds = ["nikola_tesla", "albert_einstein"]
    
    for mind_id in minds:
        print(f"\n--- Running Louvain Clustering for mind: {mind_id} ---")
        try:
            themes = await run_theme_clustering(mind_id)
            print(f"Clustering complete. Generated {len(themes)} Theme nodes for {mind_id}.")
        except Exception as e:
            print(f"Clustering failed for {mind_id}:", e)

if __name__ == "__main__":
    asyncio.run(main())
