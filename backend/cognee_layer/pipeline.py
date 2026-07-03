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
    Concept, Belief, Creation, Finding, Person, SourceFragment,
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
    name: str
    description: str


class _ExtractedCreation(BaseModel):
    """LLM output for a creation."""
    name: str
    creation_type: str
    description: str


class _ExtractedPerson(BaseModel):
    """LLM output for a connected person."""
    name: str
    role: str = ""


class _ExtractedFinding(BaseModel):
    """LLM output for a research finding or empirical observation."""
    name: str
    description: str


class _ExtractedRelationship(BaseModel):
    """LLM output for an edge between two extracted entities."""
    source_name: str
    target_name: str
    relationship_type: str


class ChunkExtractions(BaseModel):
    """Everything the LLM extracts from a single 800-token chunk."""

    concepts: list[_ExtractedConcept] = []
    beliefs: list[_ExtractedBelief] = []
    creations: list[_ExtractedCreation] = []
    people: list[_ExtractedPerson] = []
    findings: list[_ExtractedFinding] = []
    relationships: list[_ExtractedRelationship] = []


VALID_RELATIONSHIP_TYPES = {
    "supports", "contradicts", "evolved_from", "influenced_by", "created",
}

EXTRACTION_SYSTEM_PROMPT = """You are a top-tier entity extraction algorithm designed to build an intellectual knowledge graph for {person_name}.
Your task is to extract Nodes (entities) and Edges (relationships) from the provided text.
Extract ONLY what is clearly stated in THIS specific passage. Do not infer or guess outside knowledge.

# 1. Extracting Nodes
Identify the following types of entities using their EXACT field names:

concepts — Ideas, theories, intellectual constructs, or topics explicitly discussed.
  FIELDS: name (the concept's human-readable name), description (what it is), domain (optional, e.g. "physics")
  Example: {{"name": "Alternating Current", "description": "Electric current that periodically reverses direction", "domain": "electrical engineering"}}

beliefs — Personal convictions, values, or strongly held stances the person expresses.
  FIELDS: name (a short summary of the belief, e.g. "Wireless Energy is Inevitable"), description (the complete detailed sentence expressing the belief)
  Example: {{"name": "AC Superiority", "description": "Tesla believed AC was superior to DC for long-distance transmission"}}

creations — Books, patents, companies, algorithms, or artworks explicitly mentioned.
  FIELDS: name (the creation's name), creation_type (e.g. "book", "patent", "company", "power plant", "project"), description (what it is/was)
  Example: {{"name": "Wardenclyffe Tower", "creation_type": "project", "description": "Unfinished wireless transmission station"}}

people — Other individuals mentioned (include their name and role relative to {person_name}).
  FIELDS: name (full name), role (how they relate to {person_name}, e.g. "collaborator", "employer", "rival", "mentor")

findings — Specific research results, discoveries, or empirical observations.
  FIELDS: name (a short title of the finding), description (the finding itself as a complete sentence describing what was discovered)

Use the most complete human-readable name for every entity (e.g., "Alternating Current", not "Current").

# 2. Extracting Edges (Relationships)
For EVERY pair of related entities you extracted, create a relationship. A dense knowledge graph is the goal. Look for:
- Comparison or contrast between concepts → "contradicts" or "supports"
- One person or concept influencing another → "influenced_by"
- A person making or building something → "created"
- A belief or concept developing from an earlier one → "evolved_from"
- Evidence or proof relationships → "supports"

Valid relationship_type values:
- "supports": A concept or belief provides evidence or support for another.
- "contradicts": Two concepts, beliefs, or people directly conflict or oppose each other.
- "evolved_from": A belief or concept grew out of an earlier one.
- "influenced_by": A person or concept was influenced by another person or concept.
- "created": A person created a specific creation or concept.

Extract ALL relationships that are clearly stated in the passage. Do not hold back. If 5 entities are connected, extract 5 relationships. Quality AND completeness matter."""


async def extract_from_chunk(
    chunk_data: list[dict],
    ctx: PipelineContext = None,
) -> list[Any]:
    """
    Cognee pipeline Task: extract DataPoints from a single ~800-token text chunk.

    Cognee 1.2.2 passes data items wrapped in a list (batch support).
    We process one chunk at a time due to Gemini rate limits.

    chunk_data shape: list containing one dict:
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
    chunk = chunk_data[0]

    content = chunk["content"]
    person_name = chunk.get("person_name", "this person")

    source_fragment = SourceFragment(
        content=content,
        source_document_id=chunk["source_document_id"],
        source_title=chunk.get("source_title", ""),
        source_type=chunk.get("source_type", ""),
        chunk_index=chunk.get("chunk_index", 0),
    )
    datapoints: list[Any] = [source_fragment]
    node_map: dict[str, Any] = {}

    subject = Person(name=person_name, role="subject")
    datapoints.append(subject)
    node_map[person_name.lower()] = subject

    try:
        system_prompt = EXTRACTION_SYSTEM_PROMPT.format(person_name=person_name)
        extracted: ChunkExtractions = await LLMGateway.acreate_structured_output(
            content,
            system_prompt,
            ChunkExtractions,
        )

        logger.info(
            "LLM extraction results",
            concepts=len(extracted.concepts),
            beliefs=len(extracted.beliefs),
            creations=len(extracted.creations),
            people=len(extracted.people),
            findings=len(extracted.findings),
            relationships=len(extracted.relationships),
            raw_relationships=[
                f"{r.source_name} -> {r.target_name} ({r.relationship_type})"
                for r in extracted.relationships
            ],
        )

        for c in extracted.concepts:
            node = Concept(
                name=c.name,
                description=c.description,
                domain=c.domain,
            )
            datapoints.append(node)
            node_map[c.name.lower()] = node

        for b in extracted.beliefs:
            node = Belief(name=b.name, description=b.description)
            datapoints.append(node)
            node_map[b.name.lower()] = node

        for cr in extracted.creations:
            node = Creation(
                name=cr.name,
                creation_type=cr.creation_type,
                description=cr.description,
            )
            datapoints.append(node)
            node_map[cr.name.lower()] = node

        for p in extracted.people:
            node = Person(name=p.name, role=p.role)
            datapoints.append(node)
            node_map[p.name.lower()] = node

        for f in extracted.findings:
            node = Finding(name=f.name, description=f.description)
            datapoints.append(node)
            node_map[f.name.lower()] = node

        for rel in extracted.relationships:
            if rel.relationship_type not in VALID_RELATIONSHIP_TYPES:
                continue

            source = node_map.get(rel.source_name.lower())
            target = node_map.get(rel.target_name.lower())

            if not source or not target:
                continue

            if rel.relationship_type == "supports" and hasattr(source, "supports"):
                source.supports.append(target)
            elif rel.relationship_type == "contradicts" and hasattr(source, "contradicts"):
                source.contradicts.append(target)
            elif rel.relationship_type == "evolved_from" and hasattr(source, "evolved_from"):
                source.evolved_from.append(target)
            elif rel.relationship_type == "influenced_by" and hasattr(source, "influenced_by"):
                source.influenced_by.append(target)
            elif rel.relationship_type == "created" and hasattr(source, "created"):
                source.created.append(target)

    except Exception as exc:
        logger.warning(
            "LLM extraction failed for chunk, storing SourceFragment only",
            chunk_index=chunk.get("chunk_index"),
            error=str(exc),
        )

    await add_data_points(datapoints, ctx=None)

    await asyncio.sleep(GEMINI_RATE_LIMIT_SLEEP)

    logger.debug(
        "Chunk processed",
        chunk_index=chunk.get("chunk_index"),
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
    )

    logger.info(
        "Ingestion pipeline complete",
        mind_id=mind_id,
        chunks_processed=len(chunks),
    )
