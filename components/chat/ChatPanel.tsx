"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage, { type ChatMessageData } from "@/components/chat/ChatMessage";
import { isHumanHandoffIntent, buildHumanHandoffMessage } from "@/lib/chat/humanHandoff";

type ChatPanelProps = {
  onClose: () => void;
};

const WELCOME_MESSAGE = "Hi! I'm ZAZ AI. How can I help you today?";

const QUICK_ACTIONS = [
  { label: "Website Design", message: "I'm interested in Website Design." },
  { label: "Logo Design", message: "I'm interested in Logo Design." },
  { label: "Digital Marketing", message: "I'm interested in Digital Marketing." },
  { label: "Pricing", message: "Can you tell me about your pricing?" },
  { label: "Talk to a human", message: "I'd like to talk to a human." },
];

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_SENT = 20;
const FALLBACK_MESSAGE =
  "I'm having trouble connecting right now. You can leave a message for our team and we'll get back to you.";

const inputClasses =
  "w-full rounded-[var(--zaz-radius-sm)] border border-zaz-border-strong bg-zaz-surface px-4 py-3 text-sm text-zaz-text placeholder:text-zaz-muted transition-all duration-200 ease-[var(--zaz-ease)] focus:border-zaz-accent focus:shadow-[0_0_0_3px_rgba(var(--zaz-accent-rgb),0.12)] focus:outline-none";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessageData = { id: makeId(), role: "user", content: trimmed };

    // An explicit "talk to a human" request is answered deterministically,
    // from lib/data/contact.ts, without ever calling Gemini — the phone
    // number and Contact Us link are guaranteed correct this way rather
    // than depending on model phrasing for the most common handoff path.
    // Gemini still handles handoff language for less literal cases (e.g. an
    // out-of-knowledge question), per the instructions in systemPrompt.ts.
    if (isHumanHandoffIntent(trimmed)) {
      setMessages((current) => [
        ...current,
        userMessage,
        { id: makeId(), role: "assistant", content: buildHumanHandoffMessage() },
      ]);
      setInput("");
      return;
    }

    const assistantId = makeId();

    const historyToSend = [...messages, userMessage].slice(-MAX_HISTORY_SENT).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        );
      }
    } catch {
      setMessages((current) =>
        current.map((m) => (m.id === assistantId ? { ...m, content: FALLBACK_MESSAGE } : m))
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-full w-full flex-col bg-zaz-bg-deep">
      <header className="flex items-center justify-between border-b border-zaz-border px-5 py-4">
        <div>
          <p className="font-heading text-base font-semibold text-zaz-text">ZAZ AI</p>
          <p className="text-xs text-zaz-text-secondary">AI Assistant</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zaz-border-strong text-zaz-text-secondary transition-colors duration-200 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4"
        >
          <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-5 py-4">
        {showWelcome && (
          <div className="space-y-4">
            <ChatMessage id="welcome" role="assistant" content={WELCOME_MESSAGE} />
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => void sendMessage(action.message)}
                  className="rounded-[var(--zaz-radius-pill)] border border-zaz-border-strong px-3.5 py-1.5 text-xs font-medium text-zaz-text-secondary transition-colors duration-200 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} id={message.id} role={message.role} content={message.content} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-zaz-border p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type your message…"
            className={`${inputClasses} max-h-28 resize-none py-2.5`}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zaz-accent text-zaz-bg-deep transition-all duration-300 hover:bg-zaz-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12L20 4L14 20L11 13L4 12Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => void sendMessage("I'd like to talk to a human.")}
          className="mt-2 text-xs font-medium text-zaz-text-secondary transition-colors hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4"
        >
          Prefer to talk to a person? Talk to a human
        </button>
      </form>
    </div>
  );
}
