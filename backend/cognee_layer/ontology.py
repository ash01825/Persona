"""
Persona Universal Ontology — Cognee DataPoint definitions.

Design rules:
- Use Annotated[str, Dedup(), Embeddable()] — NEVER metadata: dict
- Embeddable() → field is embedded into pgvector via Qwen3 Embedding 8B
- Dedup() → deterministic UUID5 from this field; same value = same graph node
- SkipValidation[Any] for relationship fields (avoids Pydantic forward-ref issues)

Theme is NOT LLM-extracted. Themes are created in a second pass after all
extraction is complete, via Louvain community detection on Neo4j (graph_analytics.py).
"""
from __future__ import annotations

from typing import Annotated, Any

from pydantic import SkipValidation

from cognee.infrastructure.engine import DataPoint, Embeddable, Dedup


class Concept(DataPoint):
    """
    A specific idea, theory, invention, or intellectual construct discussed
    or associated with this mind. Covers scientific theories, philosophical
    positions, engineering principles, fictional constructs, and techniques.
    """

    name: Annotated[str, Dedup(), Embeddable()]
    description: Annotated[str, Embeddable()]
    domain: str = ""

    supports: SkipValidation[Any] = []
    contradicts: SkipValidation[Any] = []


class Belief(DataPoint):
    """
    A personal conviction, value, or strongly held stance.
    Distinct from Concept: this captures what the person *personally believed*
    or advocated for, not just what they knew or created.
    """

    statement: Annotated[str, Dedup(), Embeddable()]
    evolved_from: SkipValidation[Any] = None


class Creation(DataPoint):
    """
    A tangible intellectual output: book, patent, company, algorithm, artwork, paper.
    """

    name: Annotated[str, Dedup(), Embeddable()]
    creation_type: str = ""
    description: Annotated[str, Embeddable()]


class Finding(DataPoint):
    """
    A specific research result, discovery, or empirical observation.
    Primarily used for scientists, researchers, and academics.
    """

    description: Annotated[str, Dedup(), Embeddable()]


class Person(DataPoint):
    """
    A person connected to or mentioned in relation to the mind being explored.
    Covers collaborators, rivals, mentors, students, and patrons.
    """

    name: Annotated[str, Dedup(), Embeddable()]
    role: str = ""
    created: SkipValidation[Any] = []
    influenced_by: SkipValidation[Any] = []


class Institution(DataPoint):
    """
    An organization that played a role: university, company, lab, publisher, funder.
    """

    name: Annotated[str, Dedup(), Embeddable()]
    institution_type: str = ""


class SourceFragment(DataPoint):
    """
    The exact ~800-token text chunk from which entities were extracted.

    Every Concept/Belief/etc. extracted from a chunk is implicitly linked
    to that chunk's SourceFragment. This enables citation: when a user
    clicks a node, we can show the exact passage where it was found.
    """

    content: Annotated[str, Dedup(), Embeddable()]
    source_document_id: str
    source_title: str = ""
    source_type: str = ""
    chunk_index: int = 0


class Theme(DataPoint):
    """
    A macro-cluster of related nodes, generated via Louvain community detection
    on the Neo4j graph AFTER all extraction is complete.

    Themes are NEVER extracted by the LLM.
    They are created programmatically in graph_analytics.run_theme_clustering().
    """

    name: Annotated[str, Dedup(), Embeddable()]
    description: Annotated[str, Embeddable()]
    community_id: int = 0
