"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

// The Thinker data
const thinkers = [
  { id: 1, name: "Nikola Tesla", hook: "Father of the electric age", topics: ["AC Power", "Free Energy"], color: "#22d3ee" },
  { id: 2, name: "Albert Einstein", hook: "He bent spacetime with a thought", topics: ["Relativity", "Quantum"], color: "#a855f7" },
  { id: 3, name: "Ada Lovelace", hook: "First programmer, a century early", topics: ["Algorithms", "Vision"], color: "#3b82f6" },
  { id: 4, name: "Marie Curie", hook: "She discovered what no one imagined", topics: ["Radioactivity", "Resilience"], color: "#10b981" },
  { id: 5, name: "Friedrich Nietzsche", hook: "He asked the questions nobody wanted", topics: ["Will to Power", "Nihilism"], color: "#f59e0b" },
];

function ThinkerDisc({ data, position, onClick }: { data: any; position: [number, number, number]; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Smoothly rotate towards camera if hovered
      const targetRotation = hovered ? 0 : Math.sin(state.clock.elapsedTime + data.id) * 0.1;
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 0.1);
      
      // Scale effect
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={onClick}
      >
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial 
          color={hovered ? data.color : "#1f1f1f"} 
          transparent 
          opacity={hovered ? 0.9 : 0.6}
          side={THREE.DoubleSide} 
        />
        
        {/* HTML Overlay for the text inside the 3D space */}
        <Html transform zIndexRange={[100, 0]} position={[0, 0, 0.1]} distanceFactor={10}>
          <div className={`flex flex-col items-center justify-center p-4 rounded-full w-48 h-48 transition-all duration-300 ${hovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
            <h3 className="font-display text-xl font-bold text-white text-center mb-1 drop-shadow-md">{data.name}</h3>
            <p className="text-[10px] text-white/80 text-center mb-3 leading-tight">{data.hook}</p>
            <div className="flex gap-1 flex-wrap justify-center">
              {data.topics.map((t: string) => (
                <span key={t} className="text-[8px] bg-black/40 px-2 py-0.5 rounded-full border border-white/20 text-white">
                  {t}
                </span>
              ))}
            </div>
            <button className="mt-3 text-[10px] uppercase font-bold bg-white text-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              Chat →
            </button>
          </div>
        </Html>
        
        {/* Default label when not hovered */}
        {!hovered && (
          <Html transform zIndexRange={[100, 0]} position={[0, 0, 0.1]} distanceFactor={10}>
             <div className="text-white/40 font-mono text-sm tracking-widest uppercase pointer-events-none">
               {data.name.split(" ")[0]}
             </div>
          </Html>
        )}
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      
      {/* Position thinkers in a semi-circle/cluster */}
      <ThinkerDisc data={thinkers[0]} position={[-3.5, 1, -1]} onClick={() => console.log("Clicked", thinkers[0].name)} />
      <ThinkerDisc data={thinkers[1]} position={[-1.5, -0.5, 1]} onClick={() => console.log("Clicked", thinkers[1].name)} />
      <ThinkerDisc data={thinkers[2]} position={[0, 1.5, -2]} onClick={() => console.log("Clicked", thinkers[2].name)} />
      <ThinkerDisc data={thinkers[3]} position={[1.5, 0, 0]} onClick={() => console.log("Clicked", thinkers[3].name)} />
      <ThinkerDisc data={thinkers[4]} position={[3.5, 1.2, -1]} onClick={() => console.log("Clicked", thinkers[4].name)} />
    </>
  );
}

export function ThinkersSection() {
  return (
    <section id="thinkers" className="relative w-full min-h-screen bg-[#050505] py-24 flex flex-col justify-center overflow-hidden border-t border-white/5">
      {/* Header */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full mb-12">
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
            Speak with the <br className="hidden md:block" /> thinkers who <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">changed everything.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Each mind is reconstructed from thousands of primary sources. Ask Tesla about AC power. Ask Nietzsche about nihilism.
          </p>
        </motion.div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[60vh] md:h-[70vh] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Scene />
        </Canvas>
        
        {/* Instructions overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 font-mono text-xs tracking-widest uppercase pointer-events-none">
          [ Hover to interact ]
        </div>
      </div>

      {/* Build Your Own CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="group relative rounded-2xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-md p-8 md:p-12 overflow-hidden hover:border-purple-500/60 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                Build a Persona
              </h3>
              <p className="text-muted-foreground">
                Upload writings, letters, or research from someone the world has forgotten, and reconstruct their mind.
              </p>
            </div>
            <button className="shrink-0 bg-purple-500 hover:bg-purple-400 text-white font-medium px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
              Request a Mind →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
