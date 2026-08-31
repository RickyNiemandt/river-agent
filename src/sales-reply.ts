import { groqFollowUp } from "./groq";
import { scoreLead } from "./score";
import type { Env, PackageRec, SessionState } from "./types";

const Q_NEED = "What are you trying to fix or grow right now?";
const Q_TIMELINE = "When do you want this live?";
const Q_FIT =
  "Are you a solo founder, an agency/team, or an ecommerce brand?";

const GREETING_RE =
  /^(hi|h+i+|hello|hey|howz?it|howzit|good\s*(morning|afternoon|evening)|sawubona|hola|whats?\s*up|test|hi\s*again)\b/i;

const RESET_RE =
  /^(reset|start\s*over|restart|begin\s*again|start\s*again)\b/i;

/**
 * Coarse package pick from fit + need. Only Get Found, Get Selling, River Agent.
 */
export function recommendPackage(session: SessionState): PackageRec {
  const blob = `${session.fit || ""} ${session.need || ""}`.toLowerCase();

  if (
    /shop|store|ecommerce|e-?commerce|woocommerce|shopify|payfast|yoco|catalogue|catalog/.test(
      blob,
    )
  ) {
    return {
      name: "Get Selling — Growth Store",
      price: "R38,000 build + R5,900/mo excl. VAT",
      why: "Shopify/Woo store with PayFast/Yoco — ~200 products, best value for most brands",
      url: "https://charmsystemsllc.com/get-selling",
    };
  }

  if (
    /linkedin|invisible|get\s*found|outreach|website|leads?\s*online|need\s*leads/.test(
      blob,
    )
  ) {
    return {
      name: "Get Found — Growth",
      price: "R9,500/mo excl. VAT",
      why: "Site + LinkedIn engine with outreach DMs and a lead dashboard",
      url: "https://charmsystemsllc.com/get-found",
    };
  }

  if (
    /pdf|automation|workflow|spreadsheet|custom\s*automation|ecolifeos|integrate/.test(
      blob,
    )
  ) {
    return {
      name: "River Agent — Growth Bot",
      price: "R9,999/mo excl. VAT",
      why: "WhatsApp sales AI that qualifies and routes — we sell Get Found, Get Selling, and River Agent from this number",
      url: "https://charmsystemsllc.com/",
    };
  }

  if (
    /agency|team|multi|packages|routing|dashboard|growth\s*bot|whatsapp|qualify|bot/.test(
      blob,
    )
  ) {
    const agency = /agency|team|multi/.test(blob);
    if (agency) {
      return {
        name: "River Agent — Growth Bot",
        price: "R9,999/mo excl. VAT",
        why: "Best value for agencies / multi-package sellers — smart routing, scoring, priority support",
        url: "https://charmsystemsllc.com/",
      };
    }
    return {
      name: "River Agent — Starter Bot",
      price: "R5,500/mo excl. VAT",
      why: "WhatsApp sales AI for solo founders and single-service businesses — qualify + steer to a package",
      url: "https://charmsystemsllc.com/",
    };
  }

  if (/agency|team|multi/.test((session.fit || "").toLowerCase())) {
    return {
      name: "River Agent — Growth Bot",
      price: "R9,999/mo excl. VAT",
      why: "Best value for agencies / multi-package sellers — smart routing, scoring, priority support",
      url: "https://charmsystemsllc.com/",
    };
  }

  return {
    name: "River Agent — Starter Bot",
    price: "R5,500/mo excl. VAT",
    why: "WhatsApp sales AI for solo founders and single-service businesses — qualify + steer to a package",
    url: "https://charmsystemsllc.com/",
  };
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
  const t = text.trim();
  if (!t) return true;
  if (t.length <= 24 && GREETING_RE.test(t)) return true;
  return false;
}

export function isResetIntent(text: string | undefined): boolean {
  if (!text) return false;
  return RESET_RE.test(text.trim());
}

/** Restart when they say reset, or Hi after we already recommended. */
export function shouldResetSession(
  session: SessionState,
  text: string | undefined,
): boolean {
  if (isResetIntent(text)) return true;
  if (
    (session.stage === "recommend" || session.stage === "done") &&
    isGreetingOnly(text)
  ) {
    return true;
  }
  return false;
}

function recommendBubble(env: Env, session: SessionState): string {
  const email = env.SALES_CONTACT_EMAIL || "ceo@charmsystemsllc.com";
  const phone = env.SALES_CONTACT_PHONE || "+27726064522";
  const rec = recommendPackage(session);
  const score = session.score ?? scoreLead(session).score;
  const temperature = session.temperature ?? scoreLead(session).temperature;
  return (
    `Based on what you shared, I'd steer you to *${rec.name}* — ${rec.price}.\n\n` +
    `${rec.why}\n${rec.url}\n\n` +
    `I'll treat this as a ${temperature} enquiry (${score}/10).\n\n` +
    `Soft close: email ${email} or WhatsApp ${phone} and we'll lock scope.\n\n` +
    `Want me to compare Starter vs Growth on that line?`
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
  const name = session.profile_name?.split(/\s+/)[0];
  const hi = name ? `Hi ${name}` : "Hi";

  // First touch / greeting / post-reset — ask Need
  if (
    session.message_count <= 1 ||
    (previousStage === "need" &&
      session.stage === "need" &&
      (isGreetingOnly(inboundText) || isResetIntent(inboundText)))
  ) {
    return `${hi} — I'm River Agent for EcoLife Automation.\n\nI sell Get Found, Get Selling, and River Agent from ${site} (prices excl. VAT).\n\n${Q_NEED}`;
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

  // Follow-up after recommend/done — Groq if keyed, else template closer
  const groq = await groqFollowUp(env, session, inboundText);
  if (groq) return groq;
  return closerBubble(env, session);
}
