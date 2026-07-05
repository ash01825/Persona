"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative w-full bg-[#050505] pt-32 pb-16 overflow-hidden border-t border-white/5">
      
      {/* Massive Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Giant CTA */}
        <div className="flex flex-col items-center text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-[100px] font-display font-bold text-white tracking-tighter mb-8 leading-none"
          >
            Explore <br className="md:hidden" /> History.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-xl mb-10"
          >
            Don't just read about the greatest minds. Explore their unified collective intelligence.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white text-black px-10 py-5 rounded-full font-medium text-lg hover:bg-neutral-200 hover:scale-105 transition-all duration-300"
          >
            Request a Persona →
          </motion.button>
        </div>

        {/* Grid Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-16 border-t border-white/10">
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-medium mb-2">Platform</h4>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Explorer</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Minds Library</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Documentation</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-medium mb-2">Engine</h4>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Cognee Memory</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Vector Store</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Graph Analytics</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-medium mb-2">Company</h4>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">About</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Blog</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Contact</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-medium mb-2">Legal</h4>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Terms</Link>
          </div>
        </div>

        <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <p>© 2026 Persona Inc. Powered by Cognee & Gemini.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
