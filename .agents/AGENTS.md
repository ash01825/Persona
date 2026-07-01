# Persona — Project Rules

## Project Overview
Persona is a platform for exploring the intellectual minds of historical figures through interactive knowledge graphs. Users can explore a person's ideas, beliefs, inventions, and contradictions — all extracted from their actual writings and visualized as a navigable graph. The core memory layer is **Cognee** (hybrid graph-vector-relational memory engine).

## Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Graph Visualization**: `react-force-graph` (2D and 3D variants)
- **Animations**: Framer Motion
- **Auth**: Clerk
- **Real-time**: socket.io-client
- **Blog**: MDX

### Backend (`/backend`)
- **Framework**: FastAPI
- **Language**: Python 3.12+
- **Memory Engine**: Cognee SDK (`cognee[postgres-binary,neo4j,docs,scraping]` — NO baml extra)
- **LLM**: Gemini — `gemini/gemini-2.0-flash` for extraction, `gemini/gemini-2.5-flash` for chat
- **Embeddings**: `qwen/qwen3-embedding-8b` via Rewind.ai API (`https://api.rewind.ai/v1/`) — OpenAI-compatible, $0.01/M tokens, 32k context. Required for all `Embeddable()` fields in the ontology to work. EMBEDDING_API_KEY must be set in `.env`.
- **Structured Output**: `instructor` (default, NOT BAML — BAML is only for local models)
- **Real-time**: python-socketio (mounted on FastAPI)
- **HTTP Client**: httpx (async)
- **Document Parsing**: `cognee[docs]` which includes `unstructured` (handles PDF, EPUB, HTML, Word)
- **MCP**: mcp Python SDK

### Database
- PostgreSQL + pgvector (vector store + relational store — single instance)
- Neo4j (graph store — required for multi-hop reasoning and Louvain clustering)

## Architecture Conventions

### Frontend
- Use the Next.js App Router with route groups: `(marketing)` for public pages, `(app)` for authenticated app pages.
- All React components go in `/frontend/components/`, organized by feature area (e.g., `graph/`, `chat/`, `timeline/`, `landing/`, `ui/`).
- Shared types go in `/frontend/lib/types.ts`.
- API client functions go in `/frontend/lib/api.ts`.
- Socket.IO client setup goes in `/frontend/lib/socket.ts`.
- Use `"use client"` only where needed. Prefer server components for pages and layouts.

### Backend
- API routes go in `/backend/api/` (one file per resource: `minds.py`, `chat.py`, `compare.py`, etc.).
- Business logic goes in `/backend/services/` (never in route handlers directly).
- Source gathering providers go in `/backend/sources/` (one file per source: `gutenberg.py`, `patents.py`, etc.), each extending `BaseSourceProvider`.
- Cognee integration code goes in `/backend/cognee_layer/` (ontology, pipeline, query wrappers, graph analytics).
- Agent logic (source gathering orchestration, reasoning, insights) goes in `/backend/agents/`.
- MCP server code goes in `/backend/mcp_server/`.
- All request/response models go in `/backend/models/schemas.py`.

### General
- No business logic in API route handlers. Routes call services, services call Cognee/agents.
- All async. No blocking calls.
- Every function and class must have a docstring.
- Use Pydantic models for all data transfer (request bodies, response bodies, internal DTOs).

## Cognee-Specific Rules

### DataPoint Definitions
- All DataPoint models are in `/backend/cognee_layer/ontology.py` and inherit from `DataPoint`.
- **CRITICAL — Never use `metadata: dict` field.** Use `Annotated` with `Embeddable()` and `Dedup()` instead.
- `Embeddable()` → field is embedded into pgvector for semantic search.
- `Dedup()` → Cognee generates a deterministic UUID5 from this field. Identical values across different chunks resolve to the SAME graph node automatically. This is our entire deduplication strategy.
- Use `SkipValidation[Any]` for relationship fields to avoid Pydantic forward-reference issues.
- **`Theme` nodes are NOT in the LLM extraction ontology.** They are generated in a second pass via Louvain community detection on Neo4j after all extraction is complete.

### Universal Ontology (LLM-extracted node types)
| Class | What it represents |
|---|---|
| `Concept` | Ideas, theories, intellectual constructs |
| `Belief` | Personal convictions, values, stances |
| `Creation` | Books, patents, companies, algorithms |
| `Finding` | Research results, discoveries |
| `PersonNode` | Connected people (collaborators, rivals, mentors) |
| `InstitutionNode` | Universities, companies, labs |
| `SourceFragment` | The exact text chunk (for citation) |

### Cognee API Usage Patterns
```python
# Extraction task — LLM extracts into lightweight Pydantic models, we map to DataPoints
from cognee.infrastructure.llm.LLMGateway import LLMGateway
from cognee.tasks.storage import add_data_points
from cognee.modules.pipelines import Task
from cognee.modules.pipelines.models.PipelineContext import PipelineContext

async def extract_from_chunk(chunk_data: dict, ctx: PipelineContext = None):
    # 1. Call LLM with a small chunk (NOT the full document)
    extracted = await LLMGateway.acreate_structured_output(
        chunk_data["content"], system_prompt, ChunkExtractions
    )
    # 2. Map lightweight models → DataPoints
    datapoints = [SourceFragment(...), Concept(...), Belief(...)]
    # 3. Store — ctx links provenance to the dataset
    await add_data_points(datapoints, ctx=ctx)
    return datapoints

# Run pipeline
await cognee.run_custom_pipeline(
    tasks=[Task(extract_from_chunk)],
    data=chunks,          # list of chunk dicts
    dataset="mind_tesla", # one dataset per mind
    context={"person_name": "Nikola Tesla"},
)
```

### Graph Data Format for Frontend
Hierarchical lazy loading — 3 endpoints, not one massive dump:
```
GET /api/minds/{id}/graph/summary     → Theme nodes + top 20 central nodes
GET /api/minds/{id}/graph/theme/{id}  → 50 nodes in a clicked Theme
GET /api/minds/{id}/graph/node/{id}/expand → 1st+2nd degree neighbors
```
```json
// summary response shape
{
  "nodes": [{"id": "theme_1", "type": "Theme", "label": "Physics", "centrality": 1.0, "is_expanded": false}],
  "edges": [{"source": "concept_1", "target": "theme_1", "type": "belongs_to_theme"}],
  "stats": {"total_nodes": 1000, "total_edges": 2500, "sources_count": 50}
}
```

## Code Style

### Python
- Use `ruff` for linting and formatting.
- Type hints on all function signatures.
- Async functions for all I/O operations.
- Docstrings on all public functions and classes.
- Exception handling: catch specific exceptions, never bare `except`.
- Logging: use `structlog` with structured key-value logging.

### TypeScript
- Strict TypeScript (no `any` unless absolutely necessary).
- Functional components only (no class components).
- Named exports (not default exports) for components.
- Use `React.FC` sparingly — prefer explicit prop types.
- Custom hooks in `/frontend/lib/hooks/`.

## Design System

### Colors (Node Types)
| Node Type | Color | Tailwind |
|---|---|---|
| Theme | Purple | `purple-600` |
| Concept | Cyan | `cyan-400` |
| Belief | Amber | `amber-400` |
| Creation | Violet | `violet-400` |
| Finding | Emerald | `emerald-400` |
| Person | Rose | `rose-400` |
| Institution | Slate | `slate-400` |
| SourceFragment | Red | `red-400` |

### Edge Types
| Edge Type | Color | Style |
|---|---|---|
| evolved_from | Orange | Dashed |
| contradicts | Red | Solid, thicker |
| supports | Green | Solid |
| created | Blue | Solid |
| influenced_by | Purple | Solid with arrow |
| belongs_to_theme | Slate | Thin, dotted |

### UI Theme
- Background: `#0a0a0a` (near-black)
- Surface: `#141414` (cards, panels)
- Border: `#1f1f1f`
- Text primary: `#fafafa`
- Text secondary: `#a1a1aa`
- Accent: Cyan (`#22d3ee`)
- Font: Inter (body), JetBrains Mono (code/technical)

## WebSocket Events

### Client → Server
- `join_mind(mind_id)` — Subscribe to updates for a mind
- `leave_mind(mind_id)` — Unsubscribe

### Server → Client
- `source_found` — New source discovered during build
- `source_ingesting` — Source being processed
- `entity_extracted` — New DataPoint extracted
- `graph_update` — Graph data changed (new nodes/edges)
- `reasoning_path` — Traversal path during chat query (for animation)
- `build_progress` — Overall build progress percentage
- `build_complete` — Mind build finished
- `build_error` — Error during build

## File Naming
- Python: `snake_case.py`
- TypeScript: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- MDX blog posts: `kebab-case.mdx`
- Test files: `test_*.py` (Python), `*.test.tsx` (TypeScript)

## Important Notes
- The Source Gathering Agent must handle rate limiting gracefully (especially Semantic Scholar: 1 req/sec free tier).
- All Cognee operations are async. Never use sync wrappers.
- Pre-curated source documents for flagship minds live in `/data/{mind_name}/`. These are the fallback if the autonomous agent can't find enough sources online.
- The MCP server runs as a separate process (not inside FastAPI). It shares the same Cognee database.
- Blog posts should contain REAL discoveries from the mind graphs, not filler content.
