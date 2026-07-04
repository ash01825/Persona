import React from 'react';
import type { GraphNode } from '@/lib/types';
import { NODE_COLORS } from '@/lib/theme';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-lg border-l border-white/10 z-30 p-6 pointer-events-auto overflow-y-auto shadow-2xl transition-transform duration-300 transform translate-x-0">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        ✕
      </button>
      
      <div className="flex items-center gap-2 mb-4">
        <span 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: NODE_COLORS[node.type] || '#ccc' }}
        />
        <span className="text-xs uppercase tracking-wider text-gray-400 font-mono">
          {node.type}
        </span>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">{node.label}</h2>
      
      {node.description && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Description</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{node.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm border-t border-white/10 pt-4">
        <div>
          <h3 className="text-xs text-gray-500 mb-1">Connections</h3>
          <p className="text-gray-200">{node.degree || 0}</p>
        </div>
        <div>
          <h3 className="text-xs text-gray-500 mb-1">Centrality</h3>
          <p className="text-gray-200">{(node.centrality || 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
