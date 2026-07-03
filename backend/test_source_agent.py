"""
Test the Source Gathering Agent.

Set TAVILY_API_KEY and GEMINI_API_KEY in your environment before running.
Run: cd backend && python test_source_agent.py
"""
import os
import asyncio
from dotenv import load_dotenv

from agents.source_agent import SourceGatheringAgent

async def main():
    load_dotenv()
    
    if not os.getenv("TAVILY_API_KEY") or not os.getenv("GEMINI_API_KEY"):
        print("❌ Please set TAVILY_API_KEY and GEMINI_API_KEY in your .env file or environment.")
        return
        
    print("Initializing Source Gathering Agent...")
    agent = SourceGatheringAgent()
    
    print("\nStarting gather_and_chunk for 'Albert Einstein' (Targeting 2 primary sources)...")
    chunks = await agent.gather_and_chunk("Albert Einstein", max_sources=2)
    
    print(f"\n✓ Agent returned {len(chunks)} chunks!")
    
    if chunks:
        sample = chunks[0]
        print("\nSample Chunk:")
        print(f"Title: {sample['source_title']}")
        print(f"Type: {sample['source_type']}")
        print(f"Length: {len(sample['content'])} characters")
        print("\nPreview:")
        print("-" * 40)
        print(sample['content'][:500] + "...")
        print("-" * 40)
    else:
        print("✗ No chunks produced.")

if __name__ == "__main__":
    asyncio.run(main())
