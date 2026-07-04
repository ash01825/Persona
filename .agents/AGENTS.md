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
- **Auth**: TBD (Cognee built-in Clerk auth disabled; auth handled at FastAPI layer later)
- **Real-time**: socket.io-client
- **Blog**: MDX

### Backend (`/backend`)
- **Framework**: FastAPI
- **Language**: Python 3.13 (conda environment `persona`)
- **Memory Engine**: Cognee SDK **1.2.2** (`cognee[postgres-binary,neo4j,docs,scraping]`)
- **LLM Extraction**: Google Gemini — configured via LiteLLM (`gemini/gemini-3.1-flash-lite` or `gemini/gemini-2.0-flash`)
- **LLM Chat**: Google Gemini (same provider as extraction; model TBD for chat-specific config)
- **Embeddings**: Jina AI `jina-embeddings-v4` (2048 dimensions, 32k context) via OpenAI-compatible endpoint (`openai_compatible` provider). $0.01/M tokens.
- **Structured Output**: `instructor` framework (default), `json_mode` for Gemini
- **Real-time**: python-socketio (mounted on FastAPI)
- **HTTP Client**: httpx (async)
- **Document Parsing**: `cognee[docs]` which includes `unstructured` (handles PDF, EPUB, HTML, Word)
- **MCP**: mcp Python SDK

### Database
- PostgreSQL 16 + pgvector (vector store + relational store — single instance on port 5433)
- Neo4j 5 (graph store — requires **APOC** and **Graph Data Science** plugins)

### Infrastructure
- Docker Compose for all services (Postgres + Neo4j)
- Conda environment `persona` (Python 3.13)
- FastAPI runs via `uvicorn main:socket_app --reload --port 8000`

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
- `load_dotenv()` is called at module level in `config.py` **before** Cognee imports — Cognee reads env vars at import time.

## Current State (July 2025)

### ✅ Dev 1: Complete
- Cognee 1.2.2 initialized with all 5 backends (LLM, embedding, relational, vector, graph)
- 8 DataPoint types in ontology: Concept, Belief, Creation, Finding, Person, Institution, SourceFragment, Theme
- Every DataPoint has all 5 edge fields: supports, contradicts, evolved_from, influenced_by, created
- Pipeline extracts nodes + edges from ~800-token chunks via Gemini structured output
- Subject Person node auto-created for edge anchoring
- `add_data_points(datapoints, ctx=None)` — `ctx=None` is critical (avoids Cognee internal `data_item.id` error on raw dicts)
- Theme clustering via Louvain on Neo4j (GDS plugin) — stub, not yet tested with real data
- Query layer (`cognee_layer/query.py`) — stub pending `cognee.recall()` integration
- Config: all setters are **sync** in Cognee 1.2.2, dict keys use prefixed names (`llm_provider`, `vector_db_provider`, etc.)
- Auth: Cognee built-in auth **disabled** (`ENABLE_BACKEND_ACCESS_CONTROL=false`), caching disabled (`CACHING=false`)
- Connection test skipped (`COGNEE_SKIP_CONNECTION_TEST=true` — Gemini free tier endpoints timeout on pings)

### 🚧 Dev 2: In Progress
- `sources/base.py` — `SourceDocument` dataclass and `BaseSourceProvider` abstract class defined
- `sources/__init__.py` — exists (empty)
- Gutenberg, Internet Archive, YouTube transcript providers — not yet implemented
- `cognee_layer/chunker.py` — not yet created
- `agents/source_agent.py` — not yet created

### 🚧 Dev 3: Not Started
- Frontend scaffold, design system, landing page, types — see `week1_dev3.md`

### 🚧 Dev 4: Not Started
- Graph visualization — see `week1_dev4.md`

## Cognee-Specific Rules

### Cognee 1.2.2 API (CRITICAL)

All config setters are **synchronous** (no `await`). All dict keys use prefixed names:

```python
import cognee

# LLM
cognee.config.set_llm_config({
    "llm_provider": "gemini",
    "llm_model": "gemini/gemini-2.0-flash",
    "llm_api_key": "...",
})

# Embedding (OpenAI-compatible)
cognee.config.set_embedding_config({
    "embedding_provider": "openai_compatible",
    "embedding_model": "jina-embeddings-v4",
    "embedding_endpoint": "https://api.jina.ai/v1",
    "embedding_api_key": "...",
    "embedding_dimensions": 2048,
})

# Relational DB (PostgreSQL)
cognee.config.set_relational_db_config({
    "db_provider": "postgres",
    "db_host": "localhost",
    "db_port": 5433,
    "db_name": "persona",
    "db_username": "persona",
    "db_password": "persona",
})

# Vector DB (pgvector)
cognee.config.set_vector_db_config({
    "vector_db_provider": "pgvector",
    "vector_db_url": "postgresql+asyncpg://persona:persona@localhost:5433/persona",
})

# Graph DB (Neo4j)
cognee.config.set_graph_db_config({
    "graph_database_provider": "neo4j",
    "graph_database_url": "bolt://localhost:7687",
    "graph_database_username": "neo4j",
    "graph_database_password": "persona1",
})
```

### DataPoint Definitions
- All DataPoint models are in `/backend/cognee_layer/ontology.py` and inherit from `DataPoint`.
- Use `Annotated[str, Dedup(), Embeddable()]` — Cognee 1.2.2 auto-derives `metadata` from these.
- `Embeddable()` → field is embedded into pgvector for semantic search.
- `Dedup()` → Cognee generates a deterministic UUID5 from this field. Identical values across different chunks resolve to the SAME graph node automatically.
- Every DataPoint must have all 5 edge fields: `supports`, `contradicts`, `evolved_from`, `influenced_by`, `created` — all `SkipValidation[Any] = []`.
- Use `SkipValidation[Any]` for relationship fields to avoid Pydantic forward-reference issues.
- **`Theme` nodes are NOT in the LLM extraction ontology.** They are generated in a second pass via Louvain community detection on Neo4j after all extraction is complete.

### Universal Ontology (LLM-extracted node types)
| Class | What it represents |
|---|---|
| `Concept` | Ideas, theories, intellectual constructs |
| `Belief` | Personal convictions, values, stances |
| `Creation` | Books, patents, companies, algorithms |
| `Finding` | Research results, discoveries, empirical observations |
| `Person` | Connected people (collaborators, rivals, mentors, family) |
| `Institution` | Universities, companies, labs, publishers |
| `SourceFragment` | The exact text chunk (for citation) |

### Edge Types (5 LLM-extracted + 1 programmatic)
| Type | When LLM extracts |
|---|---|
| `supports` | Concept/belief provides evidence for another |
| `contradicts` | Two entities directly conflict or oppose |
| `evolved_from` | Belief or concept grew from an earlier one |
| `influenced_by` | Person/concept influenced by another |
| `created` | Person created a creation or concept |
| `belongs_to_theme` | Programmatic (Louvain clustering) — never LLM |

### Pipeline Pattern (Cognee 1.2.2)

```python
from cognee.modules.pipelines import Task
from cognee.infrastructure.llm.LLMGateway import LLMGateway
from cognee.tasks.storage import add_data_points
from pydantic import BaseModel

class ChunkExtractions(BaseModel):
    concepts: list[_ExtractedConcept] = []
    beliefs: list[_ExtractedBelief] = []
    creations: list[_ExtractedCreation] = []
    people: list[_ExtractedPerson] = []
    findings: list[_ExtractedFinding] = []
    relationships: list[_ExtractedRelationship] = []

async def extract_from_chunk(
    chunk_data: list[dict],   # Cognee 1.2.2 wraps data in a list
    ctx: PipelineContext = None,
) -> list[Any]:
    chunk = chunk_data[0]      # Unwrap

    # 1. Create subject Person + SourceFragment
    datapoints = [SourceFragment(...), Person(name=person_name, role="subject")]
    node_map: dict[str, Any] = {person_name.lower(): subject}

    # 2. LLM extraction
    extracted = await LLMGateway.acreate_structured_output(
        chunk["content"], system_prompt, ChunkExtractions
    )

    # 3. Map nodes + register in node_map for edge linking
    for c in extracted.concepts:
        node = Concept(name=c.name, description=c.description)
        datapoints.append(node)
        node_map[c.name.lower()] = node
    # ... same for beliefs, creations, people, findings

    # 4. Map relationships using node_map
    for rel in extracted.relationships:
        source = node_map.get(rel.source_name.lower())
        target = node_map.get(rel.target_name.lower())
        if source and target:
            getattr(source, rel.relationship_type).append(target)

    # 5. Store — ctx=None is CRITICAL (avoids dict.id error)
    await add_data_points(datapoints, ctx=None)
    return datapoints

# Run pipeline
await cognee.run_custom_pipeline(
    tasks=[Task(extract_from_chunk)],
    data=chunks,
    dataset="mind_tesla",
)
```

### Chat/Search Pattern

```python
# Graph traversal search (what test_cognee_poc.py uses)
from cognee.modules.search.types import SearchType
results = await cognee.search(
    query_text="What did Tesla believe?",
    query_type=SearchType.GRAPH_COMPLETION,
)
# Returns List[SearchResult] — access r.search_result

# Recall (full RAG + graph pipeline — for chat API)
results = await cognee.recall(
    query_text="What did Tesla believe about wireless energy?",
    datasets=["mind_tesla_poc"],
    include_references=True,
)
# Returns List[RecallResponse] — discriminated union by source type
```

### Known Issues
- **`ctx=None` required**: Passing a PipelineContext to `add_data_points` with raw dict chunks crashes on `data_item.id` — Cognee expects Data items.
- **Cognee auth disabled**: `ENABLE_BACKEND_ACCESS_CONTROL=false` means no multi-tenant isolation. Re-enable when FastAPI auth layer is ready.
- **Caching disabled**: `CACHING=false` ensures deterministic runs during dev. Re-enable for production performance.
- **Neo4j APOC required**: Cognee 1.2.2 adapter uses `apoc.create.addLabels`. Neo4j container must include the APOC plugin.
- **Neo4j driver**: Must use neo4j 6.2.0+ for Python 3.13 (5.x has handshake variable scoping bug).
- **Gemini free tier**: 15 RPM. Pipeline sleeps 4s between chunks. Use `COGNEE_SKIP_CONNECTION_TEST=true` to skip 30s LLM ping.
- **Jina concurrency**: Free tier 2 concurrent requests. Cognee auto-retries but adding `EMBEDDING_BATCH_SIZE=2` to `.env` prevents delays.
- **Clean reset**: Delete Docker volumes AND `cognee/.cognee_system/databases/` to fully reset pipeline state.

## Graph Data Format for Frontend
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
  "stats": {"total_nodes": 1000, "total_edges": 2500, "sources_count": 50, "themes_count": 5}
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
| supports | Green | Solid |
| contradicts | Red | Solid, thicker |
| evolved_from | Orange | Dashed |
| influenced_by | Purple | Solid with arrow |
| created | Blue | Solid |
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
- Pipeline quality depends on source quality. Library catalog pages and website navigation produce poor extraction. Feed the pipeline actual writings, speeches, and papers.
- `chunk_index` is 0-indexed within a document. SourceFragment records which chunk each entity came from for citation.
