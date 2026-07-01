"""
Pydantic schemas for all REST API request/response models.

These are NOT Cognee DataPoints — they're the shapes served to the frontend.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class GraphNode(BaseModel):
    """A single node as served to the frontend graph renderer (react-force-graph)."""

    id: str
    type: str
    label: str
    description: str
    centrality: float = 0.0
    theme_id: Optional[str] = None
    source_id: Optional[str] = None
    is_expanded: bool = False


class GraphEdge(BaseModel):
    """A relationship between two nodes."""

    source: str
    target: str
    type: str
    weight: float = 0.5
    evidence: Optional[str] = None


class GraphStats(BaseModel):
    """Aggregate statistics about a mind's graph."""

    total_nodes: int
    total_edges: int
    sources_count: int
    themes_count: int


class GraphDataResponse(BaseModel):
    """
    Response for GET /api/minds/{id}/graph.
    Returns the global graph up to a safe limit (e.g. 800 nodes).
    """

    nodes: list[GraphNode]
    edges: list[GraphEdge]
    stats: GraphStats


class MindSummary(BaseModel):
    """Summary of a mind for the discovery/listing page."""

    id: str
    name: str
    description: str
    node_count: int
    edge_count: int
    sources_count: int
    topics: list[str]
    status: str
    portrait_url: Optional[str] = None


class BuildMindRequest(BaseModel):
    """Request to start building a mind."""

    person_name: str


class ChatRequest(BaseModel):
    """A message to the mind's chat interface."""

    mind_id: str
    message: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    """A response from the mind's chat interface."""

    answer: str
    citations: list[dict]
    reasoning_path: list[str]


class CompareRequest(BaseModel):
    """Request to compare two minds on a topic or question."""

    mind_id_a: str
    mind_id_b: str
    question: str


class CompareResponse(BaseModel):
    """Comparison result showing agreements, contradictions, and divergences."""

    question: str
    mind_a_answer: str
    mind_b_answer: str
    agreements: list[str]
    contradictions: list[str]
    divergences: list[str]
    shared_nodes: list[GraphNode]
