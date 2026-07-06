"use client";

import { motion } from "framer-motion";

export function ArchitectureSection() {
  return (
    <section className="relative w-full bg-[#050505] py-24 md:py-32 overflow-hidden border-t border-white/5">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-6">
            The Graph Memory Engine
          </h2>
          <p className="text-lg text-muted-foreground">
            We ripped out standard RAG. Instead, we built a deterministic ingestion pipeline that hashes knowledge into a unified Neo4j and PostgreSQL memory fabric.
          </p>
        </div>

        {/* Minimal Bento Box Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Remember */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col hover:border-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-3">1. Remember</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our BFS agents scrape primary sources via Firecrawl. We use Pydantic schemas to strictly validate concepts, injecting them via <code className="text-xs bg-white/10 px-1 py-0.5 rounded text-white font-mono">cognee.add_data_points</code>.
            </p>
          </motion.div>

          {/* Card 2: Improve */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col hover:border-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 mb-8">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-3">2. Improve</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We invoke <code className="text-xs bg-cyan-500/20 px-1 py-0.5 rounded text-cyan-300 font-mono">cognee.improve()</code> to trigger Louvain community detection on Neo4j. It merges duplicates and clusters concepts into synthesized themes.
            </p>
          </motion.div>

          {/* Card 3: Recall */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col hover:border-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 mb-8">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-3">3. Recall</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Queries don't just hit a vector store. <code className="text-xs bg-purple-500/20 px-1 py-0.5 rounded text-purple-300 font-mono">cognee.recall()</code> traverses actual semantic graph pathways to construct a highly accurate response.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
