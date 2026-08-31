import {
  normalizeChat,
  parseHeadcount,
  pickProduct,
  type HeadcountBand,
  type ProductLine,
} from "./headcount";
import { groqFollowUp } from "./groq";
import { scoreLead } from "./score";
import type { Env, PackageRec, SessionState } from "./types";

export type { HeadcountBand, ProductLine };
export { normalizeChat, parseHeadcount, pickProduct };

const Q_NEED = "What are you trying to fix or grow right now?";
const Q_TIMELINE = "When do you want this live?";
const Q_FIT =
  "How many people in the business, including you — just you, 2-10, or 11+?";

/** Worker build stamp — if WhatsApp still sounds old, Hub is not this Worker. */
export const BUILD_ID = "2026-08-31-headcount";

const GREETING_RE =
  /^(hi+|hie+|hello|hallo|hey+|howz\s*it|howzit|good\s*(morning|afternoon|evening)|sawubona|hola|what'?s\s*up|whats\s*up|test|hi\s*again)\b/i;

const RESET_RE =
  /^(reset|rest|reste|start\s*over|restart|begin\s*again|start\s*again)\b/i;

const CATALOG: Record<ProductLine, Record<HeadcountBand, PackageRec>> = {
  selling: {
    "1": {
      name: "Get Selling — Starter Store",
      price: "R18,000 build + R2,900/mo excl. VAT",
      why: "About 50 products — right size when it is just you running the shop",
      url: "https://charmsystemsllc.com/get-selling",
    },
    "2-10": {
      name: "Get Selling — Growth Store",
      price: "R38,000 build + R5,900/mo excl. VAT",
      why: "About 200 products, shipping and policies — fits a small working team",
      url: "https://charmsystemsllc.com/get-selling",
    },
    "11+": {
      name: "Get Selling — Scale Store",
      price: "From R65,000 build + R11,900/mo excl. VAT",
      why: "Bigger catalogue and stock/accounting handoffs — built for a larger operation",
      url: "https://charmsystemsllc.com/get-selling",
    },
  },
  found: {
    "1": {
      name: "Get Found — Starter",
      price: "R4,500/mo excl. VAT",
      why: "Site plus 8 LinkedIn posts a month — enough when you are a one-person shop",
      url: "https://charmsystemsllc.com/get-found",
    },
    "2-10": {
      name: "Get Found — Growth",
      price: "R9,500/mo excl. VAT",
      why: "Outreach DMs and a lead dashboard — the usual fit for a 2-10 person team",
      url: "https://charmsystemsllc.com/get-found",
    },
    "11+": {
      name: "Get Found — Scale",
      price: "R18,000/mo excl. VAT",
      why: "Heavier outreach plus a dedicated AM — sized for 11+ people",
      url: "https://charmsystemsllc.com/get-found",
    },
  },
  river: {
    "1": {
      name: "River Agent — Starter Bot",
      price: "R5,500/mo excl. VAT",
      why: "One WhatsApp sales bot — qualify and steer, built for a solo operator",
      url: "https://charmsystemsllc.com/",
    },
    "2-10": {
      name: "River Agent — Growth Bot",
      price: "R9,999/mo excl. VAT",
      why: "Team routing and scoring — the River line for a small team (2-10)",
      url: "https://charmsystemsllc.com/",
    },
    "11+": {
      name: "River Agent — Growth Bot",
      price: "R9,999/mo excl. VAT",
      why: "Team routing and scoring — River has two tiers on the site; Growth is the 11+ fit",
      url: "https://charmsystemsllc.com/",
    },
  },
};

export function recommendPackage(session: SessionState): PackageRec {
  return CATALOG[pickProduct(session)][parseHeadcount(session.fit)];
}

export function applyScore(session: SessionState): SessionState {
  const rec = recommendPackage(session);
  const { score, temperature } = scoreLead(session);
  return {
    ...session,
    score,
    temperature,
    package_hint: rec.name,
  };
}

export function isGreetingOnly(text: string | undefined): boolean {
  if (!text) return true;
  const t = normalizeChat(text);
  if (!t) return true;
  if (t.length <= 48 && GREETING_RE.test(t)) return true;
  return false;
}

export function isResetIntent(text: string | undefined): boolean {
  if (!text) return false;
  return RESET_RE.test(normalizeChat(text));
}

/** Hi / rest / reset always starts Need again once a session has begun. */
export function shouldResetSession(
  session: SessionState,
  text: string | undefined,
): boolean {
  if (isResetIntent(text)) return true;
  if (!isGreetingOnly(text)) return false;
  const started =
    session.stage !== "need" ||
    Boolean(session.need) ||
    (session.message_count ?? 0) > 0;
  return started;
}

function opener(nameFirst: string, site: string): string {
  const who = nameFirst ? ` ${nameFirst}` : "";
  return (
    `Howzit${who} — I'm River Agent for EcoLife Automation.\n\n` +
    `I sell Get Found, Get Selling, and River Agent from ${site} (prices excl. VAT).\n\n` +
    `Say Hi or rest anytime to start over.\n\n` +
    `${Q_NEED}`
  );
}

function recommendBubble(env: Env, session: SessionState): string {
  const email = env.SALES_CONTACT_EMAIL || "ceo@charmsystemsllc.com";
  const phone = env.SALES_CONTACT_PHONE || "+27726064522";
  const rec = recommendPackage(session);
  const score = session.score ?? scoreLead(session).score;
  const temperature = session.temperature ?? scoreLead(session).temperature;
  return (
    `Sharp — based on headcount I'd steer you to *${rec.name}* — ${rec.price}.\n\n` +
    `${rec.why}\n${rec.url}\n\n` +
    `I'll treat this as a ${temperature} enquiry (${score}/10).\n\n` +
    `Soft close: email ${email} or WhatsApp ${phone} and we'll lock scope.\n\n` +
    `Want me to compare the next size up on that line?`
  );
}

function closerBubble(env: Env, session: SessionState): string {
  const email = env.SALES_CONTACT_EMAIL || "ceo@charmsystemsllc.com";
  const phone = env.SALES_CONTACT_PHONE || "+27726064522";
  const site = env.PUBLIC_SITE || "https://charmsystemsllc.com/";
  const rec = recommendPackage(session);
  return (
    `Happy to help further. Best fit right now: *${rec.name}* (${rec.price}).\n` +
    `Reach ${email} / ${phone} · ${site}`
  );
}

/**
 * Build one WhatsApp bubble for Path Direct (Worker Messaging API).
 * Call AFTER advanceStage so session.stage reflects the next ask.
 */
export async function buildSalesReply(
  env: Env,
  session: SessionState,
  inboundText: string | undefined,
  previousStage: SessionState["stage"],
): Promise<string> {
  const site = env.PUBLIC_SITE || "https://charmsystemsllc.com/";
  const name = session.profile_name?.split(/\s+/)[0] || "";

  if (
    session.message_count <= 1 ||
    (previousStage === "need" &&
      session.stage === "need" &&
      (isGreetingOnly(inboundText) || isResetIntent(inboundText)))
  ) {
    return opener(name, site);
  }

  if (session.stage === "timeline" && previousStage === "need") {
    return `Got it.\n\n${Q_TIMELINE}`;
  }

  if (session.stage === "fit" && previousStage === "timeline") {
    return `Thanks.\n\n${Q_FIT}`;
  }

  if (
    session.stage === "recommend" ||
    (previousStage === "fit" && session.fit)
  ) {
    return recommendBubble(env, session);
  }

  if (session.stage === "need") {
    return `${Q_NEED}`;
  }
  if (session.stage === "timeline") {
    return `${Q_TIMELINE}`;
  }
  if (session.stage === "fit") {
    return `${Q_FIT}`;
  }

  if (isGreetingOnly(inboundText) || isResetIntent(inboundText)) {
    return opener(name, site);
  }
  const groq = await groqFollowUp(env, session, inboundText);
  if (groq) return groq;
  return closerBubble(env, session);
}
