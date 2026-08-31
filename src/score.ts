import { parseHeadcount } from "./headcount";
import type { LeadTemperature, SessionState } from "./types";

const TIMELINE_NOW =
  /\b(now|asap|immediately|this\s+week|today|urgent|as\s+soon)\b/i;
const TIMELINE_MONTH =
  /\b(this\s+month|few\s+weeks|2\s*weeks|two\s+weeks|next\s+month|30\s*days)\b/i;

const NEED_CONCRETE =
  /\b(get\s*found|get\s*selling|river|linkedin|shopify|woocommerce|woo\b|store|shop|checkout|payfast|yoco|whatsapp|waba|leads?|outreach|website|qualify|bot|invisible|losing|enquir)/i;

export function scoreLead(session: SessionState): {
  score: number;
  temperature: LeadTemperature;
} {
  let score = 0;

  const timeline = session.timeline || "";
  if (TIMELINE_NOW.test(timeline)) score += 4;
  else if (TIMELINE_MONTH.test(timeline)) score += 3;
  else if (timeline.trim()) score += 1;

  if (session.fit?.trim()) {
    const band = parseHeadcount(session.fit);
    if (band === "11+") score += 3;
    else if (band === "2-10") score += 2;
    else score += 1;
  }

  const need = session.need || "";
  if (NEED_CONCRETE.test(need)) score += 3;
  else if (need.trim()) score += 1;

  if (score > 10) score = 10;

  const temperature: LeadTemperature =
    score >= 7 ? "hot" : score >= 4 ? "warm" : "cold";

  return { score, temperature };
}
