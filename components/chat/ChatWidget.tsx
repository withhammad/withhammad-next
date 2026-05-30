"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/easing";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  "https://calendly.com/withhammad-marketing/30min";

const GREETING =
  "Hey 👋 I'm Hammad's assistant. Ask me about results, services, or availability — or grab a call straight away.";

const QUICK_REPLIES = [
  "Are you available for hire?",
  "What results have you driven?",
  "What are your rates?",
  "Can I book a call?",
] as const;

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}

/* ------------------------------- helpers ------------------------------- */

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p.replace(/[.,)]+$/, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent-indigo)] underline underline-offset-2 hover:text-[var(--accent-amber)]"
          >
            book a call
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function TypingDots({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return <span className="text-sm text-[var(--muted)]">typing…</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/* ------------------------------ lead form ------------------------------ */

function LeadForm({
  onCancel,
  onSent,
}: {
  onCancel: () => void;
  onSent: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        onSent(name.trim() || "there");
        return;
      }
      setError(data.error ?? "Couldn't send right now.");
      setStatus("error");
    } catch {
      setError("Network hiccup — please try again.");
      setStatus("error");
    }
  };

  const field =
    "h-10 w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5 p-4">
      <div className="mb-1">
        <p className="text-sm font-medium text-[var(--text)]">
          Work with Hammad
        </p>
        <p className="text-xs text-[var(--muted)]">
          Leave your details and he&apos;ll be in touch.
        </p>
      </div>
      <input
        className={field}
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />
      <input
        className={field}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        className={field}
        placeholder="Company (optional)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        autoComplete="organization"
      />
      <textarea
        className={field + " h-20 resize-none py-2"}
        placeholder="What are you working on? (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 flex-1 rounded-xl border border-white/15 text-sm font-medium text-[var(--text)] transition-colors hover:bg-white/5"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-10 flex-1 rounded-xl bg-[var(--accent-indigo)] text-sm font-medium text-white transition-colors hover:bg-[#7C7DF3] disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send to Hammad"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------- widget -------------------------------- */

export default function ChatWidget() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the conversation pinned to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el)
      el.scrollTo({
        top: el.scrollHeight,
        behavior: reduced ? "auto" : "smooth",
      });
  }, [messages, streaming, leadOpen, reduced]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open && !leadOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open, leadOpen]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error("no stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        const text = chunk.value
          ? decoder.decode(chunk.value, { stream: true })
          : "";
        if (text) {
          setMessages((prev) => {
            const copy = prev.slice();
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = {
              role: "assistant",
              content: (last?.content ?? "") + text,
            };
            return copy;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = prev.slice();
        copy[copy.length - 1] = {
          role: "assistant",
          content: `Sorry, I had trouble responding. You can reach Hammad directly: ${CALENDLY_URL}`,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  const onLeadSent = (name: string) => {
    setLeadOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Thanks ${name} — I've passed your details to Hammad and he'll be in touch. Want to lock in a time now? ${CALENDLY_URL}`,
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Chat with Hammad's assistant"
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="flex h-[min(72vh,580px)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-indigo), #9b8bff)",
                }}
              >
                HY
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text)]">
                  Hammad&apos;s assistant
                </p>
                <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online · replies in seconds
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-[var(--text)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-hidden">
              <div
                ref={scrollRef}
                aria-live="polite"
                className="h-full space-y-3 overflow-y-auto px-4 py-4"
              >
                {/* Permanent greeting */}
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.04] px-3.5 py-2.5 text-sm text-[var(--text)]">
                  {GREETING}
                </div>

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--accent-indigo)] px-3.5 py-2.5 text-sm text-white"
                        : "max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.04] px-3.5 py-2.5 text-sm text-[var(--text)]"
                    }
                  >
                    {m.role === "assistant" && m.content === "" ? (
                      <TypingDots reduced={reduced} />
                    ) : m.role === "assistant" ? (
                      <span className="whitespace-pre-wrap">
                        <Linkified text={m.content} />
                      </span>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                ))}

                {/* Quick replies (only before the first message) */}
                {messages.length === 0 && !leadOpen ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-[var(--text)] transition-colors hover:border-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/10"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Lead form overlay */}
              <AnimatePresence>
                {leadOpen ? (
                  <motion.div
                    key="lead"
                    initial={reduced ? false : { y: 14 }}
                    animate={{ y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                    className="absolute inset-0 z-10 overflow-y-auto bg-[var(--panel)]"
                  >
                    <LeadForm
                      onCancel={() => setLeadOpen(false)}
                      onSent={onLeadSent}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Footer actions */}
            {!leadOpen ? (
              <div className="border-t border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--accent-amber)] hover:underline"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="h-3.5 w-3.5"
                      aria-hidden
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    Book a 30-min call
                  </a>
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  >
                    Work with Hammad →
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything…"
                    className="h-11 flex-1 rounded-full border border-white/10 bg-[var(--bg)] px-4 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || streaming}
                    aria-label="Send message"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--accent-indigo)] text-white transition-colors hover:bg-[#7C7DF3] disabled:opacity-40"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                    </svg>
                  </button>
                </form>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Floating bubble */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: reduced ? 0 : 0.6 }}
        whileHover={reduced ? undefined : { scale: 1.06 }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
        className="grid h-14 w-14 place-items-center rounded-full bg-[var(--accent-indigo)] text-white shadow-[0_14px_40px_-10px_rgba(99,102,241,0.8)] transition-colors hover:bg-[#7C7DF3]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.svg
              key="close"
              initial={reduced ? false : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={reduced ? false : { rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8 8.38 8.38 0 0 1 8.5-8.5A8.38 8.38 0 0 1 21 11.5Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
