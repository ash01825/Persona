"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    title: "1. Ingest Raw Text",
    description: "We don't use Wikipedia summaries. Persona ingests actual letters, books, research papers, and patents written by the historical figure.",
    visual: (
      <div className="w-full h-full p-8 flex flex-col font-mono text-[10px] sm:text-xs text-neutral-400 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
          <span className="text-white/40 ml-2">ingest_pipeline.py</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-purple-400 mb-1">async def process_document(doc_path: str):</p>
          <p className="pl-4 mb-1">text <span className="text-cyan-400">=</span> await DocumentParser.read(doc_path)</p>
          <p className="pl-4 mb-1">chunks <span className="text-cyan-400">=</span> SemanticSplitter(chunk_size<span className="text-cyan-400">=</span><span className="text-orange-400">800</span>).split(text)</p>
          <br/>
          <p className="pl-4 mb-1 text-neutral-600"># Extract entities via LLM</p>
          <p className="pl-4 mb-1">for chunk in chunks:</p>
          <p className="pl-8 mb-1">await cognee.add_data_points(</p>
          <p className="pl-12 mb-1">await LLMGateway.extract(chunk.content)</p>
          <p className="pl-8 mb-1">)</p>
        </div>
      </div>
    )
  },
  {
    title: "2. Entity Extraction",
    description: "An LLM agent reads every sentence, extracting core beliefs, contradictions, and inventions as discrete concepts.",
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="relative w-48 h-48">
          {/* Animated SVG Graph Node Extraction */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" className="stroke-white/10 fill-none" strokeWidth="1" strokeDasharray="4 4" />
            <motion.circle 
              cx="50" cy="50" r="40" 
              className="stroke-cyan-500 fill-none" 
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <circle cx="50" cy="50" r="20" className="fill-white/5 border border-white/20 stroke-white/20" strokeWidth="1"/>
            <motion.circle 
              cx="50" cy="50" r="20" 
              className="fill-white" 
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            />
            
            {/* Satellite nodes */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.g 
                key={angle}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ originX: "50px", originY: "50px" }}
              >
                <circle cx="50" cy="10" r="4" className="fill-white/80" />
                <line x1="50" y1="20" x2="50" y2="40" className="stroke-white/20" strokeWidth="1" />
              </motion.g>
            ))}
          </svg>
        </div>
      </div>
    )
  },
  {
    title: "3. Build the Graph",
    description: "Concepts are wired together. If a letter contradicts an earlier patent, an edge is drawn. The mind takes shape.",
    visual: (
      <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
        {/* Mockup of the Force Graph */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        <svg viewBox="0 0 200 200" className="w-[150%] h-[150%]">
          {[...Array(15)].map((_, i) => (
            <motion.line
              key={`edge-${i}`}
              x1={100 + Math.random() * 80 - 40}
              y1={100 + Math.random() * 80 - 40}
              x2={100 + Math.random() * 80 - 40}
              y2={100 + Math.random() * 80 - 40}
              className="stroke-white/10"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          ))}
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={100 + Math.random() * 80 - 40}
              cy={100 + Math.random() * 80 - 40}
              r={Math.random() * 4 + 2}
              className="fill-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
            />
          ))}
        </svg>
      </div>
    )
  },
  {
    title: "4. Chat with the Architecture",
    description: "When you ask a question, you aren't talking to a generic bot. The system traverses the actual graph to reason like them.",
    visual: (
      <div className="w-full h-full flex flex-col p-6 bg-[#0a0a0a]">
        <div className="flex-1 flex flex-col justify-end gap-4">
          <div className="self-end bg-white text-black px-4 py-2 rounded-2xl rounded-br-sm text-sm max-w-[80%]">
            Did you really believe in free energy?
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="self-start bg-white/10 text-white border border-white/10 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[90%]"
          >
            I did not just believe in it; I designed the apparatus to harness it. My magnifying transmitter at Wardenclyffe...
          </motion.div>
        </div>
      </div>
    )
  }
];

export function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative bg-[#050505] h-[400vh]">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* Background gradient that shifts with scroll */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            background: useTransform(
              scrollYProgress,
              [0, 0.5, 1],
              [
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(200,200,200,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(100,100,100,0.1) 0%, transparent 50%)"
              ]
            )
          }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Text Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full relative">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-12">
              <span className="w-8 h-px bg-white/30"></span>
              The Architecture
            </span>

            {/* Cross-fade text based on scroll */}
            <div className="relative h-[200px]">
              {steps.map((step, index) => {
                // Calculate when this step should be visible
                const start = index * 0.25;
                const peak = start + 0.125;
                const end = start + 0.25;

                // Clamp values between 0 and 1 to prevent WAAPI out of bounds crash
                const inStart = Math.max(0, start - 0.05);
                const outEnd = Math.min(1, end + 0.05);

                const opacity = useTransform(
                  scrollYProgress,
                  [inStart, peak, outEnd],
                  [0, 1, 0]
                );

                const y = useTransform(
                  scrollYProgress,
                  [start, peak, end],
                  [50, 0, -50]
                );

                return (
                  <motion.div
                    key={index}
                    style={{ opacity, translateY: y }}
                    className="absolute inset-0"
                  >
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                      {step.title}
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Visual Content (The "Manthan" style glowing box) */}
          <div className="w-full md:w-1/2 h-[400px] flex items-center justify-center relative perspective-1000">
            <motion.div 
              style={{
                rotateX: useTransform(scrollYProgress, [0, 1], [10, -10]),
                rotateY: useTransform(scrollYProgress, [0, 1], [-10, 10]),
              }}
              className="w-full h-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden"
            >
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              
              {steps.map((step, index) => {
                 const start = index * 0.25;
                 const peak = start + 0.125;
                 const end = start + 0.25;
 
                 // Clamp values between 0 and 1
                 const inStart = Math.max(0, start - 0.05);
                 const outEnd = Math.min(1, end + 0.05);

                 const opacity = useTransform(
                   scrollYProgress,
                   [inStart, peak, outEnd],
                   [0, 1, 0]
                 );
                 const scale = useTransform(
                    scrollYProgress,
                    [start, peak, end],
                    [0.8, 1, 1.2]
                 );
                 
                 return (
                   <motion.div
                    key={`visual-${index}`}
                    style={{ opacity, scale }}
                    className="absolute inset-0 flex items-center justify-center text-6xl"
                   >
                     {step.visual}
                   </motion.div>
                 )
              })}
              
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-[scan_2s_ease-in-out_infinite]"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
