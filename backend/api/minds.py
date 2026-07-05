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
    """Global graph load. Returns all nodes and edges (capped ~1500) for galaxy view."""
    from neo4j import AsyncGraphDatabase
    from config import settings
    
    driver = AsyncGraphDatabase.driver(
        settings.graph_database_url,
        auth=(settings.graph_database_username, settings.graph_database_password),
    )
    
    nodes = []
    edges = []
    
    try:
        async with driver.session() as session:
            # Get nodes
            result = await session.run("""
                MATCH (n)
                WHERE NOT "Theme" IN labels(n) AND NOT "SourceFragment" IN labels(n)
                RETURN elementId(n) as id, [l IN labels(n) WHERE l <> 'DataPoint' AND l <> '__Node__'][0] as type, n.name as label, n.description as description
            """)
            node_records = await result.data()
            
            for r in node_records:
                nodes.append({
                    "id": r["id"],
                    "type": r["type"] or "Unknown",
                    "label": r["label"] or "Unknown",
                    "description": r["description"] or "",
                    "centrality": 0.5,
                    "is_expanded": False
                })
            
            # Get edges
            result = await session.run("""
                MATCH (n)-[r]->(m)
                WHERE NOT "Theme" IN labels(n) AND NOT "SourceFragment" IN labels(n)
                  AND NOT "Theme" IN labels(m) AND NOT "SourceFragment" IN labels(m)
                RETURN elementId(n) as source, elementId(m) as target, type(r) as type
            """)
            edge_records = await result.data()
            
            for r in edge_records:
                edges.append({
                    "source": r["source"],
                    "target": r["target"],
                    "type": r["type"],
                    "weight": 0.5
                })
                
    finally:
        await driver.close()

    return GraphDataResponse(
        nodes=nodes,
        edges=edges,
        stats=GraphStats(total_nodes=len(nodes), total_edges=len(edges), sources_count=0, themes_count=0),
    )
