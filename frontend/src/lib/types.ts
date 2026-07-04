export interface GraphNode {
  id: string;
  type: "Theme" | "Concept" | "Belief" | "Creation" | "Finding" | "Person" | "Institution" | "SourceFragment" | "BiographicalEvent";
  label: string;
  description?: string;
  centrality?: number;
  theme_id?: string | null;
  source_id?: string | null;
  is_expanded?: boolean;
  degree?: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  weight?: number;
  evidence?: string | null;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    total_nodes: number;
    total_edges: number;
    sources_count: number;
    themes_count: number;
  };
}
