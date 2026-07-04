import React from 'react';
import { NODE_COLORS } from '@/lib/theme';

interface GraphControlsProps {
  typeFilters: string[];
  onToggleFilter: (type: string) => void;
  onResetView: () => void;
}

export function GraphControls({ typeFilters, onToggleFilter, onResetView }: GraphControlsProps) {
  const types = Object.keys(NODE_COLORS);

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 p-4 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 pointer-events-auto">
      <h3 className="text-sm font-semibold text-white mb-2">Graph Controls</h3>
      <div className="flex flex-col gap-2">
        {types.map((type) => {
          const isActive = typeFilters.length === 0 || typeFilters.includes(type);
          return (
            <button
              key={type}
              onClick={() => onToggleFilter(type)}
              className={`flex items-center gap-2 text-xs transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: NODE_COLORS[type] }}
              />
              <span className="text-gray-200">{type}</span>
            </button>
          );
        })}
      </div>
      <button 
        onClick={onResetView}
        className="mt-4 text-xs bg-white/10 text-white py-1 px-2 rounded hover:bg-white/20 transition-colors"
      >
        Reset View
      </button>
    </div>
  );
}
