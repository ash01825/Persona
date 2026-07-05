import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()
import cognee

async def main():
    datasets = ["mind_nikola_tesla", "mind_albert_einstein"]
    
    for dataset_name in datasets:
        print(f"\n--- Running cognee.improve() for dataset: {dataset_name} ---")
        print("This native Cognee API will consolidate duplicate nodes, resolve conflicting information, and synthesize the graph.")
        try:
            # Native Cognee memory improvement
            await cognee.improve(dataset=dataset_name)
            print(f"cognee.improve() completed successfully for {dataset_name}!")
        except Exception as e:
            print(f"cognee.improve() failed for {dataset_name}:", e)

if __name__ == "__main__":
    asyncio.run(main())
