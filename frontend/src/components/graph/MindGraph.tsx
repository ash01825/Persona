"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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

  const visibleNodeIds = new Set(
    graph.nodes
      .filter((node) => typeFilters.length === 0 || typeFilters.includes(node.type))
      .map((n) => n.id)
  );

  const filteredGraph = {
    nodes: graph.nodes.filter((n) => visibleNodeIds.has(n.id)),
    links: graph.edges
      .filter((e) => {
        const sourceId = typeof e.source === "string" ? e.source : e.source.id;
        const targetId = typeof e.target === "string" ? e.target : e.target.id;
        return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      })
      .map((e) => ({ ...e })),
  };

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeId;

      const degree = node.degree || 1;
      const centralityScore = node.centrality ?? 0.0;
      
      // Extremely minimal sizing. 
      // Base is a tiny dot (1.2px). Hubs scale up slightly but gracefully.
      let baseRadius = 1.2 + (degree > 10 ? Math.log10(degree) : degree * 0.1) + (centralityScore * 2);
      if (node.type === "Theme") {
         baseRadius = 4; // Themes are fixed medium size
      }
      baseRadius = Math.max(1, Math.min(5, baseRadius));
      
      const radius = isSelected || isHovered ? baseRadius + 1 : baseRadius;
      const color = NODE_COLORS[node.type] ?? "#9ca3af";
      
      // Solid opacity always. We do NOT dim the rest of the graph.
      ctx.globalAlpha = 1.0;

      // Draw the crisp, flat vector circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // Subtle stroke for selected/hovered instead of massive glow
      if (isSelected || isHovered) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Draw Labels ONLY on hover, selection, or very high zoom for hubs
      if (isSelected || isHovered || (globalScale > 4 && baseRadius > 2.5)) {
        const fontSize = Math.max(4, 10 / globalScale);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.fillStyle = isSelected || isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.6)";
        
        const label = node.label ?? "";
        const maxLen = 30;
        const displayLabel = label.length > maxLen ? label.slice(0, maxLen - 2) + "…" : label;
        ctx.fillText(
          displayLabel,
          node.x,
          node.y + radius + fontSize + (1 / globalScale)
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

      // Base thin spiderweb line
      ctx.globalAlpha = isConnectedToHovered ? 0.6 : 0.2;
      
      // Muted, subtle colors
      ctx.strokeStyle = isConnectedToHovered ? "#8892b0" : (EDGE_COLORS[link.type] ?? "#333333");
      
      // Super thin edges. E.g. 0.2px normally.
      ctx.lineWidth = (isConnectedToHovered ? 0.6 : 0.2) / globalScale;

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
      // Physics for scale-free / organic networks:
      // High repulsion so the many leaf nodes don't clump.
      // Long link distance so it feels like a large structure.
      graphRef.current.d3Force("charge").strength(-80); 
      graphRef.current.d3Force("link").distance(50);
      graphRef.current.d3Force("center").strength(0.01); // Very gentle center pull
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredGraph}
        width={size.width}
        height={size.height}
        backgroundColor={BACKGROUND_COLOR}
        nodeRelSize={2}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={(node: any) => onNodeClick(node ? node.id : null)}
        onNodeHover={(node: any) => setHoveredNodeId(node?.id ?? null)}
        onBackgroundClick={() => onNodeClick(null)}
        d3AlphaDecay={0.01} // Slower decay = more time to settle into organic shape
        d3VelocityDecay={0.25} // Smooth friction
        cooldownTicks={400}
        nodeLabel="" // Handled by canvas text
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
