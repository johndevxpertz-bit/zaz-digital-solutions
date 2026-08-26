import Link from "next/link";
import { contactInfo } from "@/lib/data/contact";

export type ChatMessageData = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const linkClasses = "underline underline-offset-2 decoration-current hover:text-zaz-accent";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns the two exact strings assistant replies use to point a visitor at
 * human help — the real phone number and the literal "/contact" path (see
 * lib/chat/systemPrompt.ts and lib/chat/humanHandoff.ts) — into real,
 * clickable links. Anything else stays plain text; this never invents a
 * link out of arbitrary content.
 */
function renderAssistantContent(content: string) {
  const pattern = new RegExp(`(${escapeRegExp(contactInfo.phone)}|/contact\\b)`, "g");
  return content.split(pattern).map((segment, index) => {
    if (segment === contactInfo.phone) {
      return (
        <a key={index} href={`tel:${contactInfo.phoneHref}`} className={linkClasses}>
          {segment}
        </a>
      );
    }
    if (segment === "/contact") {
      return (
        <Link key={index} href="/contact" className={linkClasses}>
          Contact Us
        </Link>
      );
    }
    return segment;
  });
}

/**
 * A single message bubble. Pure presentation — ChatPanel owns the
 * conversation state and streaming logic. Styled entirely from existing
 * --zaz-* tokens so it follows both themes automatically, same as every
 * other component in this project.
 */
export default function ChatMessage({ role, content }: ChatMessageData) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-[var(--zaz-radius)] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-zaz-accent text-zaz-bg-deep"
            : "border border-zaz-border bg-zaz-surface text-zaz-text"
        }`}
      >
        {isUser ? content : renderAssistantContent(content)}
      </div>
    </div>
  );
}
