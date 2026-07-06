import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function BlogPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#050505]">
      
      {/* Minimal Header */}
      <header className="h-20 flex items-center px-6 lg:px-12 border-b border-white/5 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <Link href="/" className="font-display font-bold text-white text-xl tracking-tight hover:text-cyan-400 transition-colors">
          Persona
        </Link>
      </header>

      <article className="flex-1 w-full max-w-[800px] mx-auto px-6 py-24 relative z-10">
        
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-white transition-colors mb-8">
            ← Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Building a Mind: Pushing Cognee to its Core
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-white/10 pb-8">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-black text-lg">
              A
            </div>
            <div>
              <p className="text-white font-medium">Ash</p>
              <p>July 5, 2026 • 8 min read</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-cyan-400">
          <p className="lead text-xl text-neutral-300 leading-relaxed">
            When we set out to build Persona, we realized almost immediately that standard RAG wouldn't cut it. You can't just chunk a PDF, throw it in a vector database, and expect the resulting AI to "think" like Nikola Tesla. It just spits back summaries. We needed a real architecture—a way to map concepts, track contradictions, and construct an actual worldview.
          </p>

          <p>
            That's when we discovered <strong>Cognee</strong>. Cognee isn't just a vector store; it's a memory engine that fuses vector search with relational data and, crucially, a graph database (Neo4j). We decided to rip out our old pipeline and push Cognee to its absolute limit.
          </p>

          <h3 className="text-2xl mt-12 mb-4 text-white font-bold">1. The Ingestion Engine: Custom Data Points</h3>
          <p>
            The hardest part of building a historical mind wasn't the database; it was finding the right data. We built an autonomous Breadth-First Search (BFS) agent. We feed it a seed (like "Tesla Patents"), and it uses Tavily to search, then Firecrawl to literally scrape the internet. But we don't just dump this text.
          </p>
          <p>
            We wrote a custom LLM evaluator that acts as a bouncer. If a scraped page is a Wikipedia summary, it gets dropped. If it's a primary source (a letter, an original patent), we pass it to Cognee.
          </p>
          <div className="my-8 p-6 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-neutral-300">
            We bypassed default Cognee ontology and built our own `DataPoint` models via Pydantic: `Concept`, `Belief`, `Creation`, `Finding`. Every node has 5 explicit edge fields: `supports`, `contradicts`, `evolved_from`, `influenced_by`, and `created`.
          </div>
          <p>
            By passing these Pydantic schemas into `cognee.add_data_points`, the engine automatically deterministic-hashes the data and injects it straight into our PostgreSQL and Neo4j instances simultaneously. 
          </p>

          <h3 className="text-2xl mt-12 mb-4 text-white font-bold">2. The "Improve" Cycle</h3>
          <p>
            Here's where it gets crazy. If you extract data from 100 letters, you end up with 50 nodes that essentially say "Wireless Energy". A normal graph would be an unreadable hairball. 
          </p>
          <p>
            We tapped into `cognee.improve()`. By running this, we trigger Louvain community detection natively via Neo4j's Graph Data Science (GDS) plugin. Cognee automatically clusters these disparate nodes into "Themes". It merges duplicates. It synthesizes the chaos into a structured, unified "Mind". This is the difference between a simple database and a brain.
          </p>

          <h3 className="text-2xl mt-12 mb-4 text-white font-bold">3. Reasoning via Recall</h3>
          <p>
            Finally, when you chat with Einstein on our frontend, we aren't using LangChain or standard similarity search. We hit `cognee.recall()`. 
          </p>
          <p>
            Because we embedded our text with Jina (32k context) and mapped the graph in Neo4j, the recall method traverses the actual semantic pathways. If you ask about Quantum Mechanics, it pulls the node, traverses the `contradicts` edge to find his arguments against entanglement, and feeds <em>that exact pathway</em> to Gemini 2.0 Flash to generate the response.
          </p>

          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-xl text-white font-display font-bold mb-4">
              We've just scratched the surface.
            </p>
            <p className="text-muted-foreground mb-8">
              The architecture we've built allows for real-time memory mutations, incredibly low latency, and true reasoning. We're excited to see what historical minds you uncover.
            </p>
            <Link href="/" className="inline-block bg-white text-black font-medium px-8 py-4 rounded-full hover:bg-neutral-200 transition-colors">
              Experience Persona
            </Link>
          </div>

        </div>
      </article>

      <Footer />
    </main>
  );
}
