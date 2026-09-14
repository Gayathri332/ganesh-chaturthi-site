"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "bappa";
  text: string;
  mode?: "llm" | "extractive";
  knowledgeBaseLoaded?: boolean;
}

const STARTER_PROMPTS = [
  "Why does Ganesha have an elephant head?",
  "What is Ganesh Chaturthi?",
  "Why is the modak Ganesha's favourite sweet?",
  "Who are Ganesha's parents?",
];

export default function AskGanapati() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bappa",
      text:
        "Namaste! I can share stories about Ganapati. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(STARTER_PROMPTS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const askedQuestions = useRef<string[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    askedQuestions.current = [...askedQuestions.current, question];

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, askedQuestions: askedQuestions.current }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bappa",
          text: data.answer || "I'm not sure about that one yet.",
          mode: data.mode,
          knowledgeBaseLoaded: data.knowledgeBaseLoaded,
        },
      ]);

      // Swap the suggestion chips for ones that follow on from this
      // answer, so the next round of questions builds on what was just
      // shared instead of repeating the same four starter prompts.
      if (Array.isArray(data.followUps) && data.followUps.length) {
        setSuggestions(data.followUps);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bappa", text: "I couldn't reach the answer service just now — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="ask" className="w-full max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="temple-arch bg-maroon-800/80 backdrop-blur-sm flex flex-col overflow-hidden">
        <div className="px-6 pt-10 pb-4 text-center">
          <p className="font-display italic text-2xl md:text-3xl text-gold-400">Ask about Ganapati</p>
          <p className="text-cream-200/70 text-sm mt-1">
            Answers drawn from the stories you've shared, with a web lookup when needed.
          </p>
        </div>

        <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto px-5 md:px-8 py-4 space-y-4 max-h-[26rem]">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-sindoor-500/90 text-cream-100 rounded-br-sm"
                    : "bg-maroon-700/80 text-cream-100 border border-gold-500/20 rounded-bl-sm"
                )}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                {m.role === "bappa" && m.mode && (
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-gold-300/60">
                    {m.mode === "llm" ? "woven from stories + web" : "excerpt from stories / web"}
                    {m.knowledgeBaseLoaded === false && " · no PDFs ingested yet"}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-maroon-700/80 border border-gold-500/20 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 md:px-8 pb-3 flex flex-wrap gap-2">
          {suggestions.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gold-500/30 text-cream-200/80 hover:border-gold-400 hover:text-gold-300 transition-colors disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2 px-5 md:px-8 pb-8 pt-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about Ganapati..."
            className="flex-1 bg-maroon-950/60 border border-gold-500/25 rounded-full px-4 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/40 focus:border-gold-400 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send question"
            className="shrink-0 w-10 h-10 rounded-full bg-sindoor-500 hover:bg-sindoor-400 disabled:opacity-40 disabled:hover:bg-sindoor-500 transition-colors flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F6ECDA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="6 11 12 5 18 11" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
