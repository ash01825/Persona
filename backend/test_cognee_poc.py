"""
Week 1 acceptance test.

Tests end-to-end:
  text chunk → extract entities → store in Cognee → query results

Run: cd backend && python test_cognee_poc.py

Expected output:
  ✓ Cognee initialized
  ✓ Ingestion complete (N entities extracted)
  ✓ Query returned X results
  ✓ First result: [some text about Tesla]
"""
import asyncio

from cognee_layer import initialize_cognee
from cognee_layer.pipeline import run_ingestion_pipeline


TEST_CHUNK = {
    "content": (
        "Tesla firmly believed that alternating current was far superior to direct "
        "current for long-distance power transmission. He demonstrated this through "
        "his work at Westinghouse, culminating in the Niagara Falls power plant in "
        "1895. This put him in direct conflict with Edison, who championed DC power. "
        "Tesla also held a deep conviction that wireless energy transmission across "
        "vast distances was not only possible but inevitable. This drove his most "
        "ambitious project — Wardenclyffe Tower — which he believed could provide "
        "free wireless energy to the world."
    ),
    "source_document_id": "tesla_poc_001",
    "source_title": "My Inventions (Test)",
    "source_type": "book",
    "chunk_index": 0,
    "person_name": "Nikola Tesla",
}


async def main() -> None:
    """Run the end-to-end PoC test."""
    await initialize_cognee()
    print("✓ Cognee initialized")

    await run_ingestion_pipeline([TEST_CHUNK], mind_id="tesla_poc")
    print("✓ Ingestion complete")

    import cognee
    from cognee.modules.search.types import SearchType
    results = await cognee.search(
        query_text="What did Tesla believe about wireless energy?",
        query_type=SearchType.GRAPH_COMPLETION,
    )
    print(f"✓ Query returned {len(results)} results")
    for r in results[:3]:
        text = r.search_result if hasattr(r, 'search_result') else str(r)
        print(f"  → {text}")


if __name__ == "__main__":
    asyncio.run(main())
