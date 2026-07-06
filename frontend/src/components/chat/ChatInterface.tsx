"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface({ mindId, mindName }: { mindId: string; mindName: string }) {
  const sessionId = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: `I am the reconstructed mind of ${mindName}. Ask me anything about my work, beliefs, or the context of my time.` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mind_id: mindId, message: userMessage.content })
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: data.reply 
      }]);
      setIsTyping(false);
      
      // If we wanted to pass nodes back up for highlighting:
      // if (data.nodes_used && onHighlightNodes) onHighlightNodes(data.nodes_used);

    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                msg.role === "user" 
                  ? "bg-white text-black" 
                  : "bg-white/5 text-white border border-white/10"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
            
            {/* Rich Actions for Assistant Messages */}
            {msg.role === "assistant" && (
              <div className="flex items-center gap-3 mt-2 px-2">
                <button className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-white/40 hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Cite Sources
                </button>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                <button className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-white/40 hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View on Graph
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask ${mindName.split(" ")[0]} something...`}
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] font-mono text-white/30 mt-3">
          Powered by Cognee & Gemini. Anonymous session.
        </p>
      </div>
    </div>
  );
}
