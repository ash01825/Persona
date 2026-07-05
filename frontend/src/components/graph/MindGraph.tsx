"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useWindowSize } from "@/lib/hooks/useWindowSize";
import type { GraphNode, GraphEdge } from "@/lib/types";
import { NODE_COLORS, EDGE_COLORS, BACKGROUND_COLOR } from "@/lib/theme";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false, loading: () => <GraphLoadingSkeleton /> }
);

interface MindGraphProps {
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  selectedNodeId?: string | null;
  onNodeClick?: (nodeId: string | null) => void;
  highlightedPath?: string[];
  typeFilters?: string[];
}

export function MindGraph({
  graph,
  selectedNodeId = null,
  onNodeClick = () => {},
  highlightedPath = [],
  typeFilters = [],
}: MindGraphProps) {
  const graphRef = useRef<any>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize(containerRef);

  const visibleNodeIds = useMemo(() => new Set(
    graph.nodes
      .filter((node) => typeFilters.length === 0 || typeFilters.includes(node.type))
      .map((n) => n.id)
  ), [graph.nodes, typeFilters]);

  const filteredGraph = useMemo(() => {
    return {
      nodes: graph.nodes.filter((n) => visibleNodeIds.has(n.id)),
      links: graph.edges
        .filter((e) => {
          const sourceId = typeof e.source === "string" ? e.source : (e.source as any).id;
          const targetId = typeof e.target === "string" ? e.target : (e.target as any).id;
          return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
        })
        .map((e) => ({ ...e })),
    };
  }, [graph.nodes, graph.edges, visibleNodeIds]);

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeId;

      const degree = node.degree || 1;
      const centralityScore = node.centrality ?? 0.0;
      
      // Slightly larger base size so it doesn't feel like dust, but still elegant
      let baseRadius = 2.0 + (degree > 10 ? Math.log10(degree) * 1.5 : degree * 0.15) + (centralityScore * 3);
      if (node.type === "Theme") {
         baseRadius = 5; // Themes are fixed medium size
      }
      baseRadius = Math.max(1.5, Math.min(8, baseRadius));
      
      const radius = isSelected || isHovered ? baseRadius * 1.5 : baseRadius;
      const color = NODE_COLORS[node.type] ?? "#9ca3af";
      
      ctx.globalAlpha = 1.0;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSelected || isHovered) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Draw Labels ONLY on hover, selection, OR for major hubs to give the graph structure at 100% zoom
      const isMajorHub = baseRadius > 3.5;
      if (isSelected || isHovered || (globalScale > 1.5 && isMajorHub)) {
        const fontSize = Math.max(4, 12 / globalScale);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Muted text for hubs when not hovered, bright when interacted with
        ctx.fillStyle = isSelected || isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
        
        const label = node.label ?? "";
        const maxLen = 30;
        const displayLabel = label.length > maxLen ? label.slice(0, maxLen - 2) + "…" : label;
        ctx.fillText(
          displayLabel,
          node.x,
          node.y + radius + fontSize + (2 / globalScale)
        );
      }
    },
    [selectedNodeId, hoveredNodeId] 
  );

  const linkCanvasObject = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      
      const isSourceHovered = sourceId === hoveredNodeId;
      const isTargetHovered = targetId === hoveredNodeId;
      const isConnectedToHovered = isSourceHovered || isTargetHovered;

      ctx.globalAlpha = isConnectedToHovered ? 0.8 : 0.4;
      ctx.strokeStyle = isConnectedToHovered ? "#8892b0" : (EDGE_COLORS[link.type] ?? "#444444");
      ctx.lineWidth = (isConnectedToHovered ? 1.0 : 0.4) / globalScale;

      const sx = link.source?.x ?? 0;
      const sy = link.source?.y ?? 0;
      const tx = link.target?.x ?? 0;
      const ty = link.target?.y ?? 0;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      
      ctx.globalAlpha = 1.0;
    },
    [hoveredNodeId]
  );

  useEffect(() => {
    if (graphRef.current) {
      // Slightly tighten the graph so it doesn't expand infinitely and look tiny
      graphRef.current.d3Force("charge").strength(-90); 
      graphRef.current.d3Force("link").distance(35);     
      graphRef.current.d3Force("center").strength(0.03); 
    }
  }, []);

  // Auto-zoom to fit the screen beautifully once the physics engine settles
  const handleEngineStop = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50); // 400ms transition, 50px padding
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ backgroundColor: BACKGROUND_COLOR }}>
      {/* Subtle radial vignette to give the empty space depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-0"></div>
      
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredGraph}
        width={size.width}
        height={size.height}
        backgroundColor="transparent"
        nodeRelSize={2}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={(node: any) => onNodeClick(node ? node.id : null)}
        onNodeHover={(node: any) => setHoveredNodeId(node?.id ?? null)}
        onBackgroundClick={() => onNodeClick(null)}
        d3AlphaDecay={0.02} 
        d3VelocityDecay={0.3} 
        cooldownTicks={200} // Stop engine sooner so it frames faster
        onEngineStop={handleEngineStop}
        nodeLabel="" 
      />
    </div>
  );
}

function GraphLoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
