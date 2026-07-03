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
        "Thomas Edison was a staunch defender of Direct Current (DC), believing it to be the "
        "safest and most reliable method for municipal power distribution. He established the "
        "Pearl Street Station in New York to prove its viability. Edison heavily criticized "
        "Alternating Current (AC) as dangerously high-voltage and lethal, a stance that sparked "
        "the infamous War of the Currents against George Westinghouse and his former employee, "
        "Nikola Tesla. Edison also maintained a strong conviction that practical, commercial "
        "application was the sole measure of an invention's value, which drove his prolific "
        "output at the Menlo Park laboratory."
    ),
    "source_document_id": "edison_poc_001",
    "source_title": "Edison Biography (Test)",
    "source_type": "book",
    "chunk_index": 0,
    "person_name": "Thomas Edison",
}


async def main() -> None:
    """Run the end-to-end PoC test."""
    await initialize_cognee()
    print("✓ Cognee initialized")

    await run_ingestion_pipeline([TEST_CHUNK], mind_id="edison_poc")
    print("✓ Ingestion complete")

    import cognee
    from cognee.modules.search.types import SearchType
    results = await cognee.search(
        query_text="What did Edison believe was the sole measure of an invention's value?",
        query_type=SearchType.GRAPH_COMPLETION,
    )
    print(f"✓ Query returned {len(results)} results")
    for r in results[:3]:
        text = r.search_result if hasattr(r, 'search_result') else str(r)
        print(f"  → {text}")


if __name__ == "__main__":
    asyncio.run(main())
