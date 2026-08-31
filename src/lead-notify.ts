import { sendTextMessage } from "./d360";
import type { Env, SessionState } from "./types";

export function digitsOnly(value: string | undefined): string {
  return (value || "").replace(/\D/g, "");
}

export function hotLeadWa(env: Env): string {
  return digitsOnly(env.HOT_LEAD_WA) || "27727710400";
}

function trimField(value: string | undefined, max = 80): string {
  const t = (value || "").replace(/\s+/g, " ").trim();
  if (!t) return "—";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function shouldNotifyHot(env: Env, session: SessionState): boolean {
  if (session.hot_notified) return false;
  if ((session.score ?? 0) < 7) return false;
  if (session.temperature !== "hot") return false;
  if (digitsOnly(session.wa_id) === hotLeadWa(env)) return false;
  return true;
}

export function formatHotCard(session: SessionState): string {
  const name = session.profile_name || "Unknown";
  const pkg = session.package_hint || "unscored package";
  const score = session.score ?? 0;
  return (
    `HOT *${name}* ${session.wa_id} · score ${score}/10 · *${pkg}*\n` +
    `Need: ${trimField(session.need)}\n` +
    `Timeline: ${trimField(session.timeline)}\n` +
    `Fit: ${trimField(session.fit)}`
  );
}

/** WhatsApp Ricky a hot-lead card. Failures log only. */
export async function maybeNotifyHotLead(
  env: Env,
  session: SessionState,
): Promise<boolean> {
  if (!shouldNotifyHot(env, session)) return false;
  const to = hotLeadWa(env);
  const send = await sendTextMessage(env, to, formatHotCard(session));
  if (!send.ok) {
    console.error("hot lead notify failed", send);
    return false;
  }
  console.log("hot lead notified", { to, wa_id: session.wa_id, score: session.score });
  return true;
}
