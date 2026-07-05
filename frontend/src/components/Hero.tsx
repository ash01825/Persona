"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = Math.min(window.innerWidth / 3, 400); // Dense but performant

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        
        // Premium monochromatic colors: mostly white/silver
        const r = Math.random();
        if (r < 0.2) this.color = "rgba(255, 255, 255, 0.8)"; // Bright white
        else if (r < 0.4) this.color = "rgba(200, 200, 200, 0.6)"; // Silver
        else this.color = "rgba(100, 100, 100, 0.3)"; // Dim grey
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const render = () => {
      // Trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.2)";
      ctx.fillRect(0, 0, width, height);

      // Connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance / 1000})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const titleText = "Think with the Collective Mind of History.";

  return (
    <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      
      {/* Overlay to ensure text legibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] w-full px-6 lg:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-4 mb-8"
        >
          <span className="h-[1px] w-12 bg-white/30"></span>
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Knowledge Graph · AI · History
          </span>
          <span className="h-[1px] w-12 bg-white/30"></span>
        </motion.div>

        <h1 className="font-display font-bold text-[clamp(2.5rem,8vw,6rem)] leading-[1.05] tracking-tight max-w-5xl mb-8">
          {titleText.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block whitespace-pre">
              {word.split("").map((char, charIndex) => {
                const totalIndex = titleText.indexOf(word) + charIndex;
                const isHighlight = word.includes("Collective") || word.includes("Mind");
                return (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + totalIndex * 0.03,
                      ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    className={`inline-block ${
                      isHighlight
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400"
                        : "text-foreground"
                    }`}
                  >
                    {char}
                  </motion.span>
                );
              })}
              {" "}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
        >
          Persona merges beliefs, contradictions, and inventions from raw historical text into a single, navigable, interactive brain.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button className="bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-neutral-200 hover:text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Explore the Graph →
          </button>
        </motion.div>
      </div>

      {/* Marquee Stats Strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-black/50 backdrop-blur-md overflow-hidden">
        <div className="flex w-max animate-marquee py-6 items-center hover:[animation-play-state:paused]">
          {/* Duplicate 4 times to ensure it never runs out on ultra-wide screens */}
          {[1, 2, 3, 4].map((groupIndex) => (
            <div key={groupIndex} className="flex shrink-0 items-center gap-16 px-8">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-display font-bold text-white">1,000+</span>
                <span className="text-sm text-muted-foreground flex flex-col">
                  Nodes Extracted <span className="font-mono text-[10px] uppercase mt-1 text-neutral-400">Database</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-display font-bold text-white">50</span>
                <span className="text-sm text-muted-foreground flex flex-col">
                  Primary Sources <span className="font-mono text-[10px] uppercase mt-1 text-neutral-400">Processed</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-display font-bold text-white">5</span>
                <span className="text-sm text-muted-foreground flex flex-col">
                  Thematic Clusters <span className="font-mono text-[10px] uppercase mt-1 text-neutral-400">Louvain</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-display font-bold text-white">2,500+</span>
                <span className="text-sm text-muted-foreground flex flex-col">
                  Graph Edges <span className="font-mono text-[10px] uppercase mt-1 text-neutral-400">Connected</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
