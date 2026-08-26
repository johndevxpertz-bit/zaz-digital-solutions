import { contactInfo } from "@/lib/data/contact";

/**
 * Matches an explicit request to reach a person — "talk to an expert",
 * "speak to a human", "speak with someone", "contact the team", "get a
 * call", "talk to a representative", "human assistance", etc. When this
 * matches, ChatPanel answers deterministically from lib/data/contact.ts
 * instead of asking Gemini, so the phone number and Contact Us link are
 * always exactly right and never dependent on model phrasing.
 */
const HUMAN_HANDOFF_PATTERN =
  /\b(talk|speak)\s+(to|with)\s+(an?\s+)?(expert|human|person|representative|rep|agent|someone)\b|\bcontact\s+(the\s+)?team\b|\bget\s+a\s+call\b|\bhuman\s+assistance\b/i;

export function isHumanHandoffIntent(message: string): boolean {
  return HUMAN_HANDOFF_PATTERN.test(message);
}

/**
 * The deterministic handoff reply — always includes the real phone number
 * and the literal "/contact" path (ChatMessage.tsx turns both into real
 * links), sourced only from lib/data/contact.ts, never invented.
 */
export function buildHumanHandoffMessage(): string {
  return `You can reach our team directly at ${contactInfo.phone}, or share your project details on our Contact Us page at /contact and we'll follow up with you.`;
}
