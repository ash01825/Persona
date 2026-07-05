import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()
import cognee

async def main():
    if len(sys.argv) < 2:
        mind_id = "albert_einstein"
    else:
        mind_id = sys.argv[1].lower().replace(" ", "_")
        
    dataset_name = f"mind_{mind_id}"
    print(f"Running cognee.improve() for dataset: {dataset_name}")
    print("This native Cognee API will consolidate duplicate nodes, resolve conflicting information, and synthesize the graph.")
    
    try:
        # Native Cognee memory improvement
        await cognee.improve(dataset=dataset_name)
        print("cognee.improve() completed successfully!")
    except Exception as e:
        print("cognee.improve() failed:", e)

if __name__ == "__main__":
    asyncio.run(main())
