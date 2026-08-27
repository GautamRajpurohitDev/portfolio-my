"use client";

import { useState, useRef, useEffect } from "react";
import { SlideUp } from "@/components/motion/MotionPrimitives";
import { Send, RotateCcw, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  source?: string;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What are you learning?",
  "What have you built?",
  "What's next on your roadmap?",
  "What skills are you developing?",
];

interface AskGautamSectionProps {
  hideHeader?: boolean;
}

export function AskGautamSection({ hideHeader = false }: AskGautamSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (queryOverride?: string) => {
    const textToSend = (queryOverride || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryOverride) setInput("");
    setIsLoading(true);
    setLastFailedQuery(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`Server returned status ${res.status}`);

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to generate answer");

      // Backend returns { success, reply, source, fastPath }
      const reply = data.reply as string | undefined;
      if (process.env.NODE_ENV === "development") {
        console.debug("[AskGautam Debug]", { source: data.source, fastPath: data.fastPath });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply?.trim() || "I couldn't answer that right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setLastFailedQuery(textToSend);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      setMessages((prev) => prev.filter((m) => !m.isError));
      handleSend(lastFailedQuery);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setLastFailedQuery(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Render markdown-like formatting (links, bold, code)
  const renderFormattedContent = (text: string) => {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((p, pIdx) => {
      const lines = p.split(/\n/);
      return (
        <p key={pIdx} className={pIdx > 0 ? "mt-2.5" : ""}>
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
            const bulletContent = isBullet ? trimmed.slice(2) : line;

            // Match bold `**...**`
            const parts = bulletContent.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g);

            return (
              <span key={lIdx} className={isBullet ? "block pl-3 relative before:content-['·'] before:absolute before:left-0 before:font-bold" : "block"}>
                {parts.map((part, i) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>;
                  }
                  if (part.startsWith("`") && part.endsWith("`")) {
                    return <code key={i} className="px-1 py-0.5 rounded bg-white/[0.06] text-accent font-mono text-[12px]">{part.slice(1, -1)}</code>;
                  }
                  const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                  if (linkMatch) {
                    return (
                      <a
                        key={i}
                        href={linkMatch[2]}
                        target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
                        rel={linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
                      >
                        {linkMatch[1]}
                      </a>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <section
      className={hideHeader ? "py-12 md:py-20 bg-bg" : "section border-t border-border bg-bg"}
      id="ask-gautam"
      aria-labelledby="ask-gautam-heading"
    >
      <div className="container">
        {/* ── SECTION INTRO ─────────────────────────────────────── */}
        {!hideHeader && (
          <SlideUp>
            <div className="max-w-3xl mb-14 sm:mb-16">
              <span className="label-meta block mb-3 text-accent">
                08 / ASK GAUTAM
              </span>
              <h2
                id="ask-gautam-heading"
                className="font-display font-bold tracking-tighter text-text-primary uppercase mb-4"
                style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
              >
                ASK GAUTAM
              </h2>
              <p className="text-[16px] sm:text-[18px] text-text-secondary leading-relaxed font-body max-w-2xl">
                Ask me about my current learning, projects, roadmap, skills, or background.
                Answers are generated strictly from my published portfolio.
              </p>
            </div>
          </SlideUp>
        )}

        {/* ── CHAT INTERFACE — OPEN EDITORIAL LAYOUT ─────────── */}
        <div
          className="w-full max-w-[1100px]"
          role="region"
          aria-label="Ask Gautam Portfolio Digital Representation"
        >
          {/* ── CHAT HEADER: Name + Status + Reset ─────────── */}
          <SlideUp delay={0.08}>
            <div className="flex items-center justify-between py-4 border-t border-border">
              <div className="flex items-center gap-4">
                <span className="font-display font-bold text-[13px] tracking-[0.14em] uppercase text-text-primary">
                  ASK GAUTAM
                </span>
                <span className="text-border/60">·</span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary">
                  Gautam's digital portfolio
                </span>
                <span className="text-border/60">·</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden />
                  Online
                </span>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset conversation"
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <RotateCw size={11} />
                  Reset
                </button>
              )}
            </div>
          </SlideUp>

          {/* ── CONVERSATION BODY ──────────────────────────────── */}
          <SlideUp delay={0.12}>
            {messages.length === 0 ? (
              /* ── EMPTY STATE: Greeting & Suggested Questions ──────── */
              <div className="border-t border-border pt-6 space-y-6">
                <div className="p-4 sm:p-5 rounded-lg bg-bg-elevated/50 border border-border/70 max-w-2xl">
                  <p className="text-[14px] sm:text-[15px] font-body text-text-primary leading-relaxed">
                    Hi, I&apos;m Gautam. Ask me about what I&apos;m learning, what I&apos;ve built,
                    my roadmap, skills, education, or anything I&apos;ve published here.
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary block mb-3">
                    SUGGESTED QUESTIONS
                  </span>
                  <div className="divide-y divide-border/60">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        disabled={isLoading}
                        className="w-full text-left py-3.5 sm:py-4 flex items-center justify-between gap-4 text-text-secondary text-[15px] sm:text-[16px] font-body hover:text-text-primary group cursor-pointer transition-colors"
                      >
                        <span className="group-hover:text-text-primary transition-colors">{q}</span>
                        <span className="text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all text-sm font-mono shrink-0">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── ACTIVE CONVERSATION ───────────────────────── */
              <div className="border-t border-border pt-6 space-y-6">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col",
                      m.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    {/* Role label: YOU vs GAUTAM */}
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-widest mb-1.5 font-bold",
                        m.role === "user" ? "text-accent/80" : "text-accent"
                      )}
                    >
                      {m.role === "user" ? "YOU" : "GAUTAM"}
                    </span>

                    {/* Message content */}
                    <div
                      className={cn(
                        "text-[14px] sm:text-[15px] leading-relaxed break-words rounded-[4px]",
                        m.role === "user"
                          ? "bg-accent/15 border border-accent/30 text-text-primary px-4 py-3 max-w-[85%]"
                          : m.isError
                          ? "text-error max-w-full"
                          : "text-text-primary max-w-full"
                      )}
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {m.isError ? (
                        <div className="flex flex-col gap-3">
                          <span>{m.content}</span>
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="self-start inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-error hover:text-error/80 transition-colors cursor-pointer"
                          >
                            <RotateCcw size={11} />
                            Retry
                          </button>
                        </div>
                      ) : (
                        renderFormattedContent(m.content)
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking state */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold mb-1.5">
                      GAUTAM
                    </span>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <span className="text-[13px] font-mono">Thinking</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.3s]" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </SlideUp>

          {/* ── INPUT COMPOSER ─────────────────────────────────── */}
          <SlideUp delay={0.16}>
            <div className="border-t border-border pt-5 mt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about my projects, learning, roadmap..."
                  maxLength={500}
                  aria-label="Ask Gautam a question"
                  className="flex-1 h-[50px] bg-bg-elevated border border-border focus:border-accent rounded-[4px] px-4 text-[14px] sm:text-[15px] text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors shadow-xs"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="w-[50px] h-[50px] rounded-[4px] bg-accent text-[#171717] flex items-center justify-center disabled:opacity-30 hover:bg-accent/90 transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
                >
                  <Send size={16} />
                </button>
              </form>

              <p className="font-mono text-[10px] text-text-tertiary text-center mt-3 tracking-tight">
                AI responses are generated from Gautam&apos;s published portfolio.
              </p>
            </div>
          </SlideUp>
        </div>
      </div>
    </section>
  );
}

export default AskGautamSection;
