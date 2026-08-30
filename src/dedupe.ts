import type { Env } from "./types";
import { getKv } from "./kv";
import { num } from "./util";

const DEDUPE_PREFIX = "dedupe:";

/**
 * Returns true if this message id was already processed (skip).
 * Stores the id with TTL on first sight.
 */
export async function isDuplicate(env: Env, messageId: string): Promise<boolean> {
  const kv = getKv(env);
  const k = `${DEDUPE_PREFIX}${messageId}`;
  const existing = await kv.get(k);
  if (existing) return true;
  const ttl = num(env.DEDUPE_TTL_SECONDS, 86400);
  await kv.put(k, "1", { expirationTtl: Math.max(60, ttl) });
  return false;
}
