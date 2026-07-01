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
| Backend | Python 3.12, FastAPI |
| Memory Engine | [Cognee](https://github.com/topoteretes/cognee) |
| Real-time | python-socketio + socket.io-client |
| Database | PostgreSQL |
| MCP | mcp Python SDK |

---

## Project Structure

```
persona/
├── frontend/          # Next.js 15 app
│   ├── app/
│   │   ├── (marketing)/   # Landing page, blog
│   │   └── (app)/         # Mind gallery, explorer, compare, build
│   ├── components/        # graph/, chat/, timeline/, landing/, ui/
│   └── lib/               # api.ts, socket.ts, types.ts
│
├── backend/           # FastAPI app
│   ├── api/               # Route handlers (minds, chat, compare, build)
│   ├── agents/            # Source gathering, reasoning, insight agents
│   ├── cognee_layer/      # Ontology, pipeline, query, analytics
│   ├── sources/           # Source providers (gutenberg, patents, youtube, etc.)
│   ├── services/          # Business logic
│   ├── mcp_server/        # MCP server + tools
│   └── models/            # Pydantic schemas
│
├── data/              # Pre-curated source documents for flagship minds
│   ├── tesla/
│   ├── einstein/
│   └── ...
│
└── docker-compose.yml
```

---

## Getting Started

> **Note:** Setup instructions will be finalized as the stack is confirmed during Week 1.

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL
- A Cognee-compatible LLM API key (OpenAI / Anthropic / Groq)

### Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# MCP Server (separate process)
python -m mcp_server.server
```

---

## Status

🚧 **Active development — Week 1**

This project is being built for the Cognee hiring challenge. See [`AGENTS.md`](.agents/AGENTS.md) for architecture decisions and conventions.

---

## Built With

- [Cognee](https://github.com/topoteretes/cognee) — hybrid graph-vector-relational memory engine
- [react-force-graph](https://github.com/vasturiano/react-force-graph) — graph visualization
- [FastAPI](https://fastapi.tiangolo.com/) — backend API
- [Next.js](https://nextjs.org/) — frontend framework
