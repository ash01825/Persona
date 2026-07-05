import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from cognee_layer.graph_analytics import run_theme_clustering

async def main():
    if len(sys.argv) < 2:
        mind_id = "albert_einstein"
    else:
        mind_id = sys.argv[1].lower().replace(" ", "_")
        
    print(f"Running Louvain Clustering for mind: {mind_id}")
    try:
        themes = await run_theme_clustering(mind_id)
        print(f"Clustering complete. Generated {len(themes)} Theme nodes.")
    except Exception as e:
        print("Clustering failed:", e)

if __name__ == "__main__":
    asyncio.run(main())
