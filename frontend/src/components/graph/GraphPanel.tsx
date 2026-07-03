"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MindGraph } from "./MindGraph";
import { GraphControls } from "./GraphControls";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { generateDummyGraph } from "./utils/dummyData";
import type { GraphNode, GraphEdge, GraphResponse } from "@/lib/types";

export function GraphPanel() {
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setGraphData(generateDummyGraph());
    };
    
    loadData();
  }, []);

  const handleToggleFilter = (type: string) => {
    setTypeFilters((prev) => {
      if (prev.length === 0) {
        const allTypes = Object.keys(require("@/lib/theme").NODE_COLORS);
        return allTypes.filter(t => t !== type);
      }
      if (prev.includes(type)) {
        const next = prev.filter(t => t !== type);
        if (next.length === 0) return [];
        return next;
      }
      return [...prev, type];
    });
  };

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !graphData) return null;
    return graphData.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData]);

  if (!graphData) {
    return (
      <div className="w-full h-full bg-[#111111] flex items-center justify-center">
        <div className="w-5 h-5 border border-white/20 border-t-white/80 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#111111] overflow-hidden">
      <GraphControls 
        typeFilters={typeFilters}
        onToggleFilter={handleToggleFilter}
        onResetView={() => {
          setSelectedNodeId(null);
          setHighlightedPath([]);
          setTypeFilters([]);
        }}
      />
      
      <div className="absolute inset-0 z-10">
        <MindGraph
          graph={{ nodes: graphData.nodes, edges: graphData.edges }}
          selectedNodeId={selectedNodeId}
          onNodeClick={setSelectedNodeId}
          highlightedPath={highlightedPath}
          typeFilters={typeFilters}
        />
      </div>
      
      <NodeDetailPanel 
        node={selectedNode} 
        onClose={() => setSelectedNodeId(null)} 
      />
    </div>
  );
}
