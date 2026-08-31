import type { LeadTemperature, SessionState } from "./types";

const TIMELINE_NOW =
  /\b(now|asap|immediately|this\s+week|today|urgent|as\s+soon)\b/i;
const TIMELINE_MONTH =
  /\b(this\s+month|few\s+weeks|2\s*weeks|two\s+weeks|next\s+month|30\s*days)\b/i;

const FIT_AGENCY =
  /\b(agency|team|we\s+are|our\s+(team|agency|company)|ecommerce|e-?commerce|brand|store)\b/i;
const FIT_SOLO = /\b(solo|just\s+me|myself|founder|coach|freelancer)\b/i;

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

  const fit = session.fit || "";
  if (FIT_AGENCY.test(fit)) score += 3;
  else if (FIT_SOLO.test(fit) || fit.trim()) score += 2;

  const need = session.need || "";
  if (NEED_CONCRETE.test(need)) score += 3;
  else if (need.trim()) score += 1;

  if (score > 10) score = 10;

  const temperature: LeadTemperature =
    score >= 7 ? "hot" : score >= 4 ? "warm" : "cold";

  return { score, temperature };
}
