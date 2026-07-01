"""Minds API — global graph endpoints and mind management."""
from fastapi import APIRouter
from models.schemas import (
    MindSummary,
    GraphDataResponse,
    GraphStats,
)

router = APIRouter()


@router.get("/", response_model=list[MindSummary])
async def list_minds() -> list[MindSummary]:
    """List all available minds with their build status."""
    return []


@router.get("/{mind_id}", response_model=MindSummary)
async def get_mind(mind_id: str) -> MindSummary:
    """Get a single mind by ID."""
    return MindSummary(
        id=mind_id, name=mind_id, description="", node_count=0,
        edge_count=0, sources_count=0, topics=[], status="ready",
    )


@router.get("/{mind_id}/graph", response_model=GraphDataResponse)
async def get_graph(mind_id: str) -> GraphDataResponse:
    """Global graph load. Returns all nodes and edges (capped ~800) for galaxy view."""
    return GraphDataResponse(
        nodes=[],
        edges=[],
        stats=GraphStats(total_nodes=0, total_edges=0, sources_count=0, themes_count=0),
    )
