"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";

// Dynamically import force-graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export function GraphSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // Generate mock graph data that looks like a dense brain/knowledge graph
    const nodes = [];
    const links = [];
    const numNodes = 150;

    // Create a central "hub" node
    nodes.push({ id: 0, group: 0, val: 20, label: "Nikola Tesla" });

    // Create clusters
    for (let i = 1; i < numNodes; i++) {
      const group = Math.floor(Math.random() * 5) + 1; // 5 themes
      nodes.push({
        id: i,
        group,
        val: Math.random() * 5 + 2,
        label: `Concept ${i}`
      });

      // Connect to center mostly, but some to random others
      if (Math.random() > 0.3) {
        links.push({
          source: i,
          target: 0,
        });
      } else {
        links.push({
          source: i,
          target: Math.floor(Math.random() * i),
        });
      }
      
      // Add cross links within clusters
      if (i > 5 && Math.random() > 0.8) {
         links.push({
           source: i,
           target: i - Math.floor(Math.random() * 3 + 1)
         });
      }
    }

    setGraphData({ nodes, links } as any);

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[80vh] bg-black overflow-hidden border-y border-white/5">
      {/* Background radial gradient to give depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black pointer-events-none z-0"></div>

      {isInView && (
        <div className="absolute inset-0 z-0 opacity-70">
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeColor={(node: any) => {
              if (node.id === 0) return "#f59e0b"; // Center is amber
              const colors = ["#22d3ee", "#a855f7", "#3b82f6", "#10b981", "#ef4444"];
              return colors[(node.group as number) - 1] || "#22d3ee";
            }}
            nodeRelSize={4}
            linkColor={() => "rgba(255,255,255,0.1)"}
            linkWidth={0.5}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            cooldownTicks={100}
            backgroundColor="transparent"
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Inter`;
              
              // Draw Node
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();
              
              // Glow effect
              ctx.shadowColor = node.color;
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.shadowBlur = 0; // reset
              
              // Draw label if zoomed in enough or it's the center node
              if (globalScale > 2 || node.id === 0) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fillText(label, node.x, node.y + node.val + fontSize);
              }
            }}
          />
        </div>
      )}

      {/* Floating Glass Overlay */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[500px] bg-gradient-to-r from-black via-black/80 to-transparent z-10 p-6 md:p-16 flex flex-col justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="pointer-events-auto"
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-cyan-400 mb-6">
            <span className="w-8 h-px bg-cyan-400/50"></span>
            The Engine
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6 text-white">
            A brain, not a chatbot.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Stop talking to flat text. Explore the intellectual architecture of history's greatest minds through a living, interactive knowledge graph. Every node is a cited source.
          </p>
          <button className="flex items-center gap-2 text-sm font-mono bg-white/5 border border-white/10 px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-white group backdrop-blur-md">
            Grab a node and pull <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>
      </div>
      
      {/* Edge fades */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
    </section>
  );
}
