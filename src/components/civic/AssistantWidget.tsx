import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { assistantReply } from "@/lib/civic/ai";
import { SimulatedAiTag } from "./AiInsights";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = ["How do I report a pothole?", "How can I track my complaint?", "What does Under Review mean?"];

function renderText(text: string) {
  return text.split("\n").map((line, i) => (
    <p key={i} className={i ? "mt-1" : ""}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") ? (
          <strong key={j} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={j}>{part}</span>
        ),
      )}
    </p>
  ));
}

export function AssistantChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm the **CivicPulse Assistant**. Ask me how to report an issue, track a complaint or what a status means." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: assistantReply(t) }]);
      setTyping(false);
    }, 650);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
            {m.role === "bot" && (
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand text-primary-foreground">
                <Bot className="size-3.5" />
              </span>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-tl-md border border-border bg-card/70 text-muted-foreground",
              )}
            >
              {m.role === "bot" ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-brand text-primary-foreground">
              <Bot className="size-3.5" />
            </span>
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-card/70 px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-thin">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => send(s)} className="shrink-0 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/12">
            {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about CivicPulse…"
          className="h-10 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <button type="submit" aria-label="Send" disabled={!input.trim() || typing} className="grid size-10 place-items-center rounded-xl bg-brand text-primary-foreground disabled:opacity-40">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[32rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl glass shadow-[var(--shadow-card)] animate-fade-up sm:right-6">
          <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground glow">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold">CivicPulse Assistant</p>
                <SimulatedAiTag />
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
              <X className="size-4" />
            </button>
          </div>
          <AssistantChat className="min-h-0 flex-1" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open CivicPulse Assistant"}
        className="fixed bottom-6 right-4 z-40 grid size-14 place-items-center rounded-2xl bg-brand text-primary-foreground glow transition-transform hover:scale-105 sm:right-6"
      >
        <span className="absolute inset-0 rounded-2xl bg-primary/40 animate-pulse-ring" />
        {open ? <X className="relative size-6" /> : <Bot className="relative size-6" />}
      </button>
    </>
  );
}
