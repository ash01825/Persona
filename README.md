# Persona

> **Explore the mind of any thinker in history.**

Persona is a platform for navigating the intellectual DNA of historical and modern figures. Type a name — our agent autonomously gathers everything they ever wrote, said, or published, builds a knowledge graph of their ideas, beliefs, and contradictions using [Cognee](https://github.com/topoteretes/cognee), and lets you explore, question, and compare how they think.

The graph is the product. The chat is a feature.

---

## What It Does

- **Mind Gallery** — Browse pre-built minds: Tesla, Einstein, Darwin, Karpathy, and more
- **Interactive Mind Graph** — Navigate 800+ ideas, beliefs, inventions, and connections extracted from real source documents
- **Chat with Sourcing** — Ask any question; every answer cites the exact document, letter, or paper it came from
- **Visible Reasoning** — Watch the graph light up as the agent traverses ideas to answer your question
- **Mind Comparison** — Overlay two minds; see where they agree, where they contradict, and why
- **Intellectual Timeline** — Scrub through decades and watch a mind evolve
- **Build Any Mind** — Type any name or upload documents; the agent builds the graph automatically
- **MCP Layer** — Expose any mind as a tool that external AI agents (Claude, Cursor, etc.) can query

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion |
| Graph Visualization | react-force-graph (2D / 3D) |
| Backend | Python 3.13 (conda), FastAPI |
| Memory Engine | [Cognee](https://github.com/topoteretes/cognee) 1.2.2 |
| LLM Extraction | Google Gemini (via LiteLLM) |
| Embeddings | Jina AI embeddings-v4 (OpenAI-compatible, 2048 dims) |
| Vector Store | pgvector (PostgreSQL 16) |
| Graph Store | Neo4j 5 (APOC + GDS plugins) |
| Relational Store | PostgreSQL (same instance as pgvector) |
| Structured Output | instructor (json_mode for Gemini) |
| Real-time | python-socketio + socket.io-client |
| MCP | mcp Python SDK |

---

## Project Structure

```
persona/
├── frontend/               # Next.js 15 app
│   ├── app/
│   │   ├── (marketing)/    # Landing page, blog
│   │   └── (app)/          # Mind gallery, explorer, compare, build
│   ├── components/         # graph/, chat/, timeline/, landing/, ui/
│   └── lib/                # api.ts, socket.ts, types.ts
│
├── backend/                # FastAPI app
│   ├── api/                # Route handlers (minds, chat, compare, build)
│   ├── agents/             # Source gathering, reasoning, insight agents
│   ├── cognee_layer/       # Ontology, pipeline, query, graph analytics
│   ├── sources/            # Source providers (gutenberg, internet_archive, youtube)
│   ├── services/           # Business logic (stubs)
│   ├── mcp_server/         # MCP server + tools (stub)
│   └── models/             # Pydantic schemas
│
├── data/                   # Pre-curated source documents for flagship minds
│   ├── tesla/
│   ├── einstein/
│   └── ...
│
└── docker-compose.yml      # PostgreSQL (pgvector) + Neo4j
```

---

## How the Extraction Works

```
Text chunk (~800 tokens)
        ↓
Gemini LLM (structured output)
        ↓
Extracts: Concepts, Beliefs, Creations, People, Findings
  + Edges: supports, contradicts, evolved_from, influenced_by, created
        ↓
add_data_points() → Cognee stores:
  • Nodes + Edges → Neo4j (graph store)
  • Embeddings → pgvector (semantic search)
  • Metadata → PostgreSQL (relational)
        ↓
Dedup() merges same entities across chunks → one Neo4j node
Louvain clustering (GDS) → Theme nodes (programmatic, not LLM)
```

**8 Node Types**: Concept, Belief, Creation, Finding, Person, Institution, SourceFragment, Theme

**6 Edge Types**: supports, contradicts, evolved_from, influenced_by, created, belongs_to_theme

---

## Getting Started

### Prerequisites
- Docker (for PostgreSQL + Neo4j)
- Conda (for Python 3.13 environment)
- Google Gemini API key (AI Studio)
- Jina AI API key (for embeddings)
- Node.js 20+ (for frontend)

### Backend Setup

```bash
# Create conda environment
conda create -n persona python=3.13
conda activate persona

# Install dependencies
cd backend
pip install -r requirements.txt

# Copy and fill in API keys
cp .env.example .env
# Edit .env with your Gemini and Jina API keys

# Start Docker services
cd ..
docker compose up -d

# Run the proof-of-concept test
cd backend
COGNEE_SKIP_CONNECTION_TEST=true python test_cognee_poc.py
```

### Expected Test Output

```
✓ Cognee initialized
✓ Ingestion complete (10 DataPoints extracted and stored)
✓ Query returned 1 results
  → Tesla believed that wireless energy transmission... was inevitable
```

### Neo4j Browser
- URL: `http://localhost:7474`
- Username: `neo4j`
- Password: `persona1`

### Dev Clean Reset

```bash
docker compose down -v
docker compose up -d
rm -rf /opt/anaconda3/envs/persona/lib/python3.13/site-packages/cognee/.cognee_system/databases
```

---

## API Endpoints (Stubs in Progress)

| Method | Path | Status |
|---|---|---|
| GET | `/api/minds` | Stub (returns `[]`) |
| GET | `/api/minds/{id}` | Stub |
| GET | `/api/minds/{id}/graph` | Stub |
| POST | `/api/chat` | Stub |
| POST | `/api/compare` | Stub |
| POST | `/api/build` | Stub |

---

## Status

🚧 **Week 1 — Dev 1 Complete, Dev 2-4 In Progress**

- ✅ Cognee 1.2.2 pipeline: text chunks → LLM extraction → Neo4j + pgvector
- ✅ Ontology: 8 DataPoint types with 5 edge types
- ✅ PoC test passes: Tesla chunk extraction + graph search
- ✅ Docker Compose: PostgreSQL (pgvector) + Neo4j (APOC + GDS)
- 🚧 Source gathering agents (Gutenberg, Internet Archive)
- 🚧 Frontend (Next.js 15 scaffold, design system)
- 🚧 Graph visualization (react-force-graph)

See `.agents/AGENTS.md` for architecture decisions, conventions, and Cognee 1.2.2 API reference. See `.agents/week1_dev*.md` for individual developer specs.
