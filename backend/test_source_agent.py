"""
Test the Source Gathering Agent.

Set TAVILY_API_KEY and GEMINI_API_KEY in your environment before running.
Run: cd backend && python test_source_agent.py
"""
import os
import asyncio
import warnings
from dotenv import load_dotenv

warnings.filterwarnings("ignore")

from agents.source_agent import SourceGatheringAgent

async def main():
    load_dotenv()
    
    if not os.getenv("TAVILY_API_KEY") or not os.getenv("GEMINI_API_KEY") or not os.getenv("FIRECRAWL_API_KEY"):
        print("❌ Please set TAVILY_API_KEY, GEMINI_API_KEY, and FIRECRAWL_API_KEY in your .env file or environment.")
        return
        
    print("Initializing Source Gathering Agent...")
    agent = SourceGatheringAgent()
    
    print("\nStarting gather_and_chunk for 'Albert Einstein' (Targeting 10 primary sources)...")
    chunks = await agent.gather_and_chunk("Albert Einstein", max_sources=10)
    
    print(f"\n✓ Agent returned {len(chunks)} chunks!")
    
    if chunks:
        # Save to JSON for analysis
        output_path = "/Users/ash/Desktop/30June/backend/einstein_test_chunks.json"
        import json
        with open(output_path, "w") as f:
            json.dump(chunks, f, indent=2)
        print(f"\nSaved all chunks to {output_path} for analysis.")
        
        sample = chunks[0]
        print("\nSample Chunk Preview:")
        print(f"Title: {sample['source_title']}")
        print(f"Type: {sample['source_type']}")
        print(f"Length: {len(sample['content'])} characters")
    else:
        print("✗ No chunks produced.")

if __name__ == "__main__":
    asyncio.run(main())
