import { GraphPanel } from "@/components/graph/GraphPanel";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Home, History, Bookmark, Settings, Layers, Workflow, Share2, Download } from "lucide-react";
import Link from "next/link";

export default async function MindAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const mindName = id === "einstein" ? "Albert Einstein" : 
                   id === "tesla" ? "Nikola Tesla" : 
                   "Unknown Persona";

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white">
      
      {/* Left Icon Sidebar */}
      <aside className="w-16 flex flex-col items-center py-6 border-r border-white/5 bg-[#0a0a0a]">
        <Link href="/" className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold mb-8 hover:bg-neutral-200 transition-colors">
          P
        </Link>
        <nav className="flex flex-col gap-6 w-full items-center">
          <button className="text-white/40 hover:text-white transition-colors" title="Home"><Home size={20} /></button>
          <button className="text-white/40 hover:text-white transition-colors" title="History"><History size={20} /></button>
          <button className="text-white/40 hover:text-white transition-colors" title="Saved Nodes"><Bookmark size={20} /></button>
          <div className="w-6 h-px bg-white/10 my-2"></div>
          <button className="text-white/40 hover:text-white transition-colors" title="Settings"><Settings size={20} /></button>
        </nav>
      </aside>

      {/* Main Content Area (Graph + Chat) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header / Toolbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {mindName} Graph
            </h1>
            <div className="w-px h-4 bg-white/10 mx-2"></div>
            {/* Graph Tools */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-md transition-colors"><Layers size={14}/> Clustering</button>
              <button className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-md transition-colors"><Workflow size={14}/> Layout</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white"><Share2 size={16} /></button>
            <button className="text-white/60 hover:text-white"><Download size={16} /></button>
          </div>
        </header>

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: The Interactive Graph (65%) */}
          <div className="w-[65%] h-full relative border-r border-white/5">
            <GraphPanel />
          </div>

          {/* Right: The Chat Interface (35%) */}
          <div className="w-[35%] h-full">
            <ChatInterface mindId={id} mindName={mindName} />
          </div>
        </div>
      </div>
    </main>
  );
}
