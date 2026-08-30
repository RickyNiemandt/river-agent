import type { Env } from "./types";
import { getKv } from "./kv";
import { num } from "./util";

const RL_PREFIX = "rl:";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  window_seconds: number;
}

/**
 * Fixed-window rate limit per wa_id.
 * Returns allowed=false when over limit (caller should skip wake).
 */
export async function checkRateLimit(
  env: Env,
  wa_id: string,
): Promise<RateLimitResult> {
  const kv = getKv(env);
  const limit = num(env.RATE_LIMIT_MAX, 12);
  const windowSeconds = num(env.RATE_LIMIT_WINDOW_SECONDS, 60);
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const k = `${RL_PREFIX}${wa_id}:${bucket}`;

  const raw = await kv.get(k);
  const count = raw ? Number(raw) || 0 : 0;
  if (count >= limit) {
    return { allowed: false, count, limit, window_seconds: windowSeconds };
  }

  await kv.put(k, String(count + 1), {
    expirationTtl: windowSeconds + 5,
  });
  return {
    allowed: true,
    count: count + 1,
    limit,
    window_seconds: windowSeconds,
  };
}
