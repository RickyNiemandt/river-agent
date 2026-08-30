import { isGreetingOnly } from "./sales-reply";
import type { Env, QualifyStage, SessionState } from "./types";
import { getKv } from "./kv";
import { num } from "./util";

const SESSION_PREFIX = "session:";

function key(wa_id: string): string {
  return `${SESSION_PREFIX}${wa_id}`;
}

export async function getSession(
  env: Env,
  wa_id: string,
): Promise<SessionState | null> {
  const raw = await getKv(env).get(key(wa_id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function createSession(
  wa_id: string,
  profile_name?: string,
): SessionState {
  const now = new Date().toISOString();
  return {
    wa_id,
    profile_name,
    stage: "need",
    message_count: 0,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Advance qualification stage heuristically from inbound text.
 * Path Direct Worker replies use this; Automation can refine when enabled.
 */
export function advanceStage(
  session: SessionState,
  text: string | undefined,
): SessionState {
  const next = { ...session };
  const now = new Date().toISOString();
  next.updated_at = now;
  next.last_inbound_at = now;
  next.message_count = (session.message_count ?? 0) + 1;
  if (!text) return next;

  const t = text.trim();
  if (!t) return next;

  const stage: QualifyStage = session.stage;
  if (stage === "need" && !session.need) {
    // Don't treat "hi" as the business need
    if (isGreetingOnly(t) && (session.message_count ?? 0) === 0) {
      return next;
    }
    if (isGreetingOnly(t) && !session.need) {
      return next;
    }
    next.need = t.slice(0, 500);
    next.stage = "timeline";
  } else if (stage === "timeline" && !session.timeline) {
    next.timeline = t.slice(0, 500);
    next.stage = "fit";
  } else if (stage === "fit" && !session.fit) {
    next.fit = t.slice(0, 500);
    next.stage = "recommend";
  } else if (stage === "recommend") {
    next.stage = "done";
  }

  return next;
}

export async function saveSession(env: Env, session: SessionState): Promise<void> {
  const ttl = num(env.SESSION_TTL_SECONDS, 604800);
  await getKv(env).put(key(session.wa_id), JSON.stringify(session), {
    expirationTtl: ttl,
  });
}
