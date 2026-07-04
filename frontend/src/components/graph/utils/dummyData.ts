import type { GraphNode, GraphEdge, GraphResponse } from "@/lib/types";

// Generate an organic, scale-free network using Preferential Attachment (Barabási-Albert model)
export function generateDummyGraph(): GraphResponse {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  const numNodes = 400;
  const initialNodes = 5; // Start with a small core

  // Core Themes (The initial nodes)
  const themeLabels = ["Physics", "Philosophy", "Engineering", "Business", "Futurism"];
  
  for (let i = 0; i < initialNodes; i++) {
    nodes.push({
      id: `node_${i}`,
      type: "Theme",
      label: themeLabels[i],
      description: `Core theme: ${themeLabels[i]}`,
      centrality: 1.0,
      theme_id: null,
      source_id: null,
      is_expanded: false,
      degree: 0,
    });
  }

  // Fully connect the initial core so they form a central hub
  for (let i = 0; i < initialNodes; i++) {
    for (let j = i + 1; j < initialNodes; j++) {
      edges.push({
        source: `node_${i}`,
        target: `node_${j}`,
        type: "supports",
        weight: 1.0,
        evidence: null,
      });
      nodes[i].degree! += 1;
      nodes[j].degree! += 1;
    }
  }

  // Node types distribution (excluding Theme)
  const types: ("Concept" | "Belief" | "Creation" | "Finding" | "Person" | "Institution" | "SourceFragment" | "BiographicalEvent")[] = [
    "Concept", "Concept", "Concept", "Concept", // Concepts are most common
    "Belief", "Belief",
    "Creation", "Creation",
    "Finding", "Finding",
    "Person", 
    "Institution",
    "SourceFragment", "SourceFragment", "SourceFragment",
    "BiographicalEvent", "BiographicalEvent"
  ];

  // Preferential Attachment: New nodes prefer to connect to existing nodes with high degrees
  for (let i = initialNodes; i < numNodes; i++) {
    const newNodeId = `node_${i}`;
    const nodeType = types[Math.floor(Math.random() * types.length)];
    
    const newNode: GraphNode = {
      id: newNodeId,
      type: nodeType,
      label: `${nodeType} ${i}`,
      description: `Details about ${nodeType} ${i}`,
      centrality: 0.1,
      theme_id: null,
      source_id: null,
      is_expanded: false,
      degree: 0,
    };
    
    nodes.push(newNode);
    
    // Connect to m existing nodes (m = 1 or 2 to create a tree-like/sparse organic structure)
    const m = Math.random() > 0.7 ? 2 : 1; 
    let connectionsMade = 0;
    
    // Calculate total degree for probability distribution
    let totalDegree = nodes.reduce((sum, n) => sum + (n.degree || 0), 0);
    
    // Track targets to avoid duplicate edges
    const targets = new Set<string>();
    
    // Try to make m connections
    let attempts = 0;
    while (connectionsMade < m && attempts < 10) {
      attempts++;
      
      // Roulette wheel selection based on degree
      let r = Math.random() * totalDegree;
      let selectedNodeId: string | null = null;
      
      for (let j = 0; j < i; j++) {
        r -= (nodes[j].degree || 0.1); // Add 0.1 so degree 0 can still be picked
        if (r <= 0) {
          selectedNodeId = nodes[j].id;
          break;
        }
      }
      
      if (selectedNodeId && !targets.has(selectedNodeId)) {
        targets.add(selectedNodeId);
        
        edges.push({
          source: newNodeId,
          target: selectedNodeId,
          type: Math.random() > 0.8 ? "contradicts" : "supports", // mostly supports
          weight: Math.random() * 0.5 + 0.5,
          evidence: null,
        });
        
        // Update degrees
        newNode.degree! += 1;
        const targetNode = nodes.find(n => n.id === selectedNodeId);
        if (targetNode) targetNode.degree! += 1;
        
        connectionsMade++;
      }
    }
  }

  // Calculate simulated centrality based on final degree (normalized 0-1)
  const maxDegree = Math.max(...nodes.map(n => n.degree || 0));
  nodes.forEach(n => {
    n.centrality = (n.degree || 0) / maxDegree;
  });

  return {
    nodes,
    edges,
    stats: { total_nodes: nodes.length, total_edges: edges.length, sources_count: 50, themes_count: 5 },
  };
}
