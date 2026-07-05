"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const thinkers = [
  { 
    id: "einstein", 
    name: "Albert Einstein",
    lastName: "EINSTEIN", 
    hook: "He bent spacetime with a thought.", 
    topics: ["Relativity", "Quantum", "Cosmology"],
    image: "/images/einstein.jpg" 
  },
  { 
    id: "tesla", 
    name: "Nikola Tesla",
    lastName: "TESLA", 
    hook: "The father of the electric age.", 
    topics: ["AC Power", "Free Energy", "Invention"],
    image: "/images/tesla.jpg" 
  },
];

export function ThinkersSection() {
  return (
    <section id="thinkers" className="relative w-full min-h-screen bg-[#050505] py-24 flex flex-col justify-center overflow-hidden border-t border-white/5">
      
      {/* Header */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-white/30"></span>
            Explore Minds
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white mb-6">
            Speak with the <br className="hidden md:block" /> thinkers who <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">changed everything.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Each mind is reconstructed from thousands of primary sources. Ask Tesla about AC power. Ask Einstein about relativity.
          </p>
        </motion.div>
      </div>

      {/* Portrait Grid */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full flex flex-col md:flex-row gap-12">
        
        {thinkers.map((thinker, i) => (
          <Link href={`/minds/${thinker.id}`} key={thinker.id} className="w-full md:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="group relative h-[600px] w-full rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-700 cursor-pointer flex flex-col justify-end"
            >
              {/* Massive background text */}
              <div className="absolute top-10 left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <span className="font-display font-bold text-[120px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-transparent tracking-tighter mix-blend-overlay">
                  {thinker.lastName}
                </span>
              </div>

              {/* 3D Bust Image */}
              <div className="absolute inset-0 top-12 bottom-24 flex items-center justify-center z-10">
                <img 
                  src={thinker.image} 
                  alt={thinker.name}
                  className="w-[120%] h-[120%] object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] mix-blend-screen"
                />
              </div>
              
              {/* Gradient fade from bottom for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-30 p-8 flex flex-col justify-end">
                <h3 className="text-3xl font-display font-bold text-white mb-2">
                  {thinker.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-[280px]">
                  {thinker.hook}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {thinker.topics.map(t => (
                    <span key={t} className="text-[10px] uppercase font-mono tracking-wider bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white group-hover:border-white/30 group-hover:bg-white/10 transition-colors duration-500">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* Build Your Own Card - Styled to match */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full md:w-1/3 group relative h-[600px] rounded-[2rem] overflow-hidden bg-[#050505] border border-dashed border-white/20 hover:border-solid hover:border-white/40 transition-all duration-700 flex flex-col items-center justify-center text-center p-8 cursor-pointer"
          >
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10 w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white transition-all duration-500">
              <svg className="w-8 h-8 text-white group-hover:text-black transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="relative z-10 text-3xl font-display font-bold text-white mb-4">
              Request a Persona
            </h3>
            <p className="relative z-10 text-muted-foreground text-sm max-w-[250px] mb-8 leading-relaxed">
              Have someone in mind? Request a historical figure, and our agents will reconstruct their mind.
            </p>
            <button className="relative z-10 bg-white/10 text-white font-medium px-8 py-4 rounded-full group-hover:bg-white group-hover:text-black transition-colors duration-500">
              Join the Waitlist →
            </button>
        </motion.div>

      </div>
    </section>
  );
}
