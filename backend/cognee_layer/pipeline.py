"""
Two-phase extraction pipeline for Persona.

Phase 1 (this file): Per-chunk LLM extraction → DataPoints → Cognee storage
Phase 2 (graph_analytics.py): Post-processing Louvain clustering → Theme nodes
"""
import asyncio
import structlog
from typing import Any

import cognee
from cognee.modules.pipelines import Task
from cognee.modules.pipelines.models.PipelineContext import PipelineContext
from cognee.infrastructure.llm.LLMGateway import LLMGateway
from cognee.tasks.storage import add_data_points
from pydantic import BaseModel

from cognee_layer.ontology import (
    Concept, Belief, Creation, Person, SourceFragment,
)

logger = structlog.get_logger()

GEMINI_RATE_LIMIT_SLEEP = 4.0


class _ExtractedConcept(BaseModel):
    """LLM output for a concept."""
    name: str
    description: str
    domain: str = ""


class _ExtractedBelief(BaseModel):
    """LLM output for a belief."""
    statement: str


class _ExtractedCreation(BaseModel):
    """LLM output for a creation."""
    name: str
    creation_type: str
    description: str


class _ExtractedPerson(BaseModel):
    """LLM output for a connected person."""
    name: str
    role: str = ""


class ChunkExtractions(BaseModel):
    """Everything the LLM extracts from a single 800-token chunk."""

    concepts: list[_ExtractedConcept] = []
    beliefs: list[_ExtractedBelief] = []
    creations: list[_ExtractedCreation] = []
    people: list[_ExtractedPerson] = []


EXTRACTION_SYSTEM_PROMPT = """You are analyzing a text passage written by or about {person_name}.

Extract ONLY what is clearly stated in THIS specific passage. Do not infer or guess.

- concepts: Ideas, theories, intellectual constructs, topics explicitly discussed
- beliefs: Personal convictions or strongly held stances the person expresses
- creations: Books, patents, companies, algorithms, artworks explicitly mentioned
- people: Other individuals mentioned (their name and role relative to {person_name})

Return empty lists if nothing clear is found for a category.
Be conservative. Quality over quantity."""


async def extract_from_chunk(
    chunk_data: dict,
    ctx: PipelineContext = None,
) -> list[Any]:
    """
    Cognee pipeline Task: extract DataPoints from a single ~800-token text chunk.

    chunk_data shape:
        {
            "content": str,
            "source_document_id": str,
            "source_title": str,
            "source_type": str,
            "chunk_index": int,
            "person_name": str,
        }

    Returns list of DataPoints stored. Also persisted to Cognee.
    """
    content = chunk_data["content"]
    person_name = chunk_data.get("person_name", "this person")

    source_fragment = SourceFragment(
        content=content,
        source_document_id=chunk_data["source_document_id"],
        source_title=chunk_data.get("source_title", ""),
        source_type=chunk_data.get("source_type", ""),
        chunk_index=chunk_data.get("chunk_index", 0),
    )
    datapoints: list[Any] = [source_fragment]

    try:
        system_prompt = EXTRACTION_SYSTEM_PROMPT.format(person_name=person_name)
        extracted: ChunkExtractions = await LLMGateway.acreate_structured_output(
            content,
            system_prompt,
            ChunkExtractions,
        )

        for c in extracted.concepts:
            datapoints.append(Concept(
                name=c.name,
                description=c.description,
                domain=c.domain,
            ))

        for b in extracted.beliefs:
            datapoints.append(Belief(statement=b.statement))

        for cr in extracted.creations:
            datapoints.append(Creation(
                name=cr.name,
                creation_type=cr.creation_type,
                description=cr.description,
            ))

        for p in extracted.people:
            datapoints.append(Person(name=p.name, role=p.role))

    except Exception as exc:
        logger.warning(
            "LLM extraction failed for chunk, storing SourceFragment only",
            chunk_index=chunk_data.get("chunk_index"),
            error=str(exc),
        )

    await add_data_points(datapoints, ctx=ctx)

    await asyncio.sleep(GEMINI_RATE_LIMIT_SLEEP)

    logger.debug(
        "Chunk processed",
        chunk_index=chunk_data.get("chunk_index"),
        entities=len(datapoints) - 1,
    )

    return datapoints


async def run_ingestion_pipeline(
    chunks: list[dict],
    mind_id: str,
) -> None:
    """
    Run the full Phase 1 extraction pipeline for a list of text chunks.

    Rate limiting: Gemini free tier = 15 RPM.
    We process chunks sequentially with a 4-second sleep between LLM calls.

    Args:
        chunks: List of chunk dicts (see extract_from_chunk docstring for shape)
        mind_id: Unique identifier for this mind (e.g. "tesla", "einstein")

    After this completes, call graph_analytics.run_theme_clustering(mind_id)
    to generate Theme nodes from the extracted graph.
    """
    dataset_name = f"mind_{mind_id}"

    logger.info("Starting ingestion pipeline", mind_id=mind_id, chunks=len(chunks))

    for i, chunk in enumerate(chunks):
        chunk["_rate_limit_index"] = i

    await cognee.run_custom_pipeline(
        tasks=[Task(extract_from_chunk)],
        data=chunks,
        dataset=dataset_name,
        context={"person_name": mind_id},
    )

    logger.info(
        "Ingestion pipeline complete",
        mind_id=mind_id,
        chunks_processed=len(chunks),
    )
