/**
 * In-memory, per-IP sliding-window rate limit for /api/chat.
 *
 * KNOWN LIMITATION: Vercel serverless functions are stateless and can run
 * as many concurrent instances — this Map only tracks requests seen by
 * *one* instance's process memory, and is wiped whenever an instance cold-
 * starts or scales down. It is a reasonable, zero-dependency v1 safeguard
 * against a single script hammering one warm instance, but it is NOT a
 * real production rate limit: a determined abuser (or just normal traffic
 * routed across multiple instances) can exceed the stated limit. A correct
 * limit requires shared state — e.g. Vercel KV / Upstash Redis — which was
 * intentionally not added here per the v1 scope for this feature.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

// Bounds the map itself so a flood of distinct IPs can't grow this
// unboundedly within one instance's lifetime.
const MAX_TRACKED_IPS = 5000;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const existing = hits.get(ip) ?? [];
  const recent = existing.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);

  if (hits.size >= MAX_TRACKED_IPS && !hits.has(ip)) {
    const oldestKey = hits.keys().next().value;
    if (oldestKey !== undefined) hits.delete(oldestKey);
  }

  hits.set(ip, recent);
  return false;
}
