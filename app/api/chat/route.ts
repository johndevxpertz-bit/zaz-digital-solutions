import { buildSystemPrompt } from "@/lib/chat/systemPrompt";
import { isRateLimited } from "@/lib/chat/rateLimit";

export const runtime = "nodejs";

// Gemini's REST streaming endpoint — official shape confirmed against
// ai.google.dev/api/generate-content: {model}:streamGenerateContent, SSE via
// ?alt=sse, auth via the x-goog-api-key header (never a query param, so the
// key never ends up in a URL/log line). gemini-3.5-flash-lite is Google's
// current free-tier model recommended for high-throughput, cost-sensitive
// chat use — no billing account required to use it.
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 500;

const FALLBACK_MESSAGE =
  "I'm having trouble connecting right now. You can leave a message for our team and we'll get back to you.";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Accepts only a plain { role: "user" | "assistant", content: string }[]
 * shape. Anything else — a "system"/"developer" role, non-string content,
 * extra fields — is rejected outright. This is what makes it impossible for
 * a request body to inject or override the system prompt: the server always
 * constructs that itself (see buildSystemPrompt()) and never reads a system
 * message from the client.
 */
function parseMessages(body: unknown): ClientMessage[] | null {
  if (!body || typeof body !== "object" || !("messages" in body)) return null;
  const { messages } = body as { messages: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const parsed: ClientMessage[] = [];
  for (const entry of messages) {
    if (!entry || typeof entry !== "object") return null;
    const { role, content } = entry as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.length === 0) return null;
    if (content.length > MAX_MESSAGE_LENGTH) return null;
    parsed.push({ role, content });
  }

  // Keep only the most recent messages — bounds both the request payload
  // sent to Gemini and the resulting cost/latency.
  return parsed.slice(-MAX_HISTORY_MESSAGES);
}

function textStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return new Response("You're sending messages a little too quickly. Please wait a moment and try again.", {
      status: 429,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Malformed request.", { status: 400 });
  }

  const messages = parseMessages(body);
  if (!messages) {
    return new Response("Malformed request.", { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("POST /api/chat: GEMINI_API_KEY is not set — chatbot cannot respond.");
    return new Response(textStream(FALLBACK_MESSAGE), {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Gemini uses "user"/"model" roles, not "user"/"assistant" — the
        // client-facing shape stays "assistant" (see ChatMessage.tsx) and is
        // only remapped here, at the boundary to this specific provider.
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        systemInstruction: {
          parts: [{ text: buildSystemPrompt() }],
        },
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }),
    });
  } catch (error) {
    console.error("POST /api/chat: failed to reach Gemini —", error);
    return new Response(textStream(FALLBACK_MESSAGE), {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const errorBody = await upstream.text().catch(() => "");
    console.error(`POST /api/chat: Gemini responded ${upstream.status} —`, errorBody);
    return new Response(textStream(FALLBACK_MESSAGE), {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Re-streams only the plain text deltas from Gemini's SSE response — the
  // client never sees raw Gemini event framing, just the text as it's
  // generated, appended straight into the visible assistant message.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const upstreamBody = upstream.body;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      let buffer = "";
      let sentAny = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const event = JSON.parse(data);

              if (event.promptFeedback?.blockReason || event.error) {
                // A well-formed response that nonetheless carries a
                // safety block or an API error — surfaced in logs so a
                // real failure like this isn't invisible behind an
                // otherwise-normal 200 request, then handled the same
                // as any other empty result below.
                console.error("POST /api/chat: Gemini returned an error/block —", JSON.stringify(event));
                continue;
              }

              const text = event.candidates?.[0]?.content?.parts?.[0]?.text;
              if (typeof text === "string" && text.length > 0) {
                controller.enqueue(encoder.encode(text));
                sentAny = true;
              }
            } catch {
              // Ignore any single malformed SSE frame rather than aborting
              // an otherwise-good stream over it.
            }
          }
        }

        if (!sentAny) {
          controller.enqueue(encoder.encode(FALLBACK_MESSAGE));
        }
      } catch (error) {
        console.error("POST /api/chat: error while streaming Gemini response —", error);
        if (!sentAny) {
          controller.enqueue(encoder.encode(FALLBACK_MESSAGE));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
