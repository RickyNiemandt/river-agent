import type { Env, SessionState } from "./types";

const Q_NEED = "What are you trying to fix or grow right now?";
const Q_TIMELINE = "When do you want this live?";
const Q_FIT =
  "Are you a solo founder, an agency/team, or an ecommerce brand?";

const GREETING_RE =
  /^(hi|h+i+|hello|hey|howz?it|howzit|good\s*(morning|afternoon|evening)|sawubona|hola|whats?\s*up|test)\b/i;

/**
 * Coarse package pick from fit + need text (site prices excl. VAT).
 * Automation / River MCP can refine; Worker uses this for Path Direct go-live.
 */
export function recommendPackage(
  session: SessionState,
): { name: string; price: string; why: string; url: string } {
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
    /linkedin|invisible|leads|get\s*found|outreach|content|website\s*and\s*linkedin/.test(
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
    /pdf|automation|workflow|spreadsheet|custom|bot\s*build|ecolifeos|integrate/.test(
      blob,
    )
  ) {
    return {
      name: "Custom Automation — Growth Build",
      price: "R12,499/mo excl. VAT",
      why: "Up to 3 automations, 12h/mo, EcoLifeOS included — first automation live in 14 days of locked scope",
      url: "https://charmsystemsllc.com/custom-automation",
    };
  }

  if (
    /agency|team|multi|packages|routing|dashboard|growth\s*bot/.test(blob)
  ) {
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

export function isGreetingOnly(text: string | undefined): boolean {
  if (!text) return true;
  const t = text.trim();
  if (!t) return true;
  if (t.length <= 24 && GREETING_RE.test(t)) return true;
  return false;
}

/**
 * Build one WhatsApp bubble for Path Direct (Worker Messaging API).
 * Call AFTER advanceStage so session.stage reflects the next ask.
 */
export function buildSalesReply(
  env: Env,
  session: SessionState,
  inboundText: string | undefined,
  previousStage: SessionState["stage"],
): string {
  const email = env.SALES_CONTACT_EMAIL || "ceo@charmsystemsllc.com";
  const phone = env.SALES_CONTACT_PHONE || "+27726064522";
  const site = env.PUBLIC_SITE || "https://charmsystemsllc.com/";
  const name = session.profile_name?.split(/\s+/)[0];
  const hi = name ? `Hi ${name}` : "Hi";

  // First touch / greeting — ask Need without treating "hi" as the need answer
  if (
    session.message_count <= 1 ||
    (previousStage === "need" &&
      session.stage === "need" &&
      isGreetingOnly(inboundText))
  ) {
    return `${hi} — I'm River Agent for EcoLife Automation.\n\nI sell packages from ${site} (prices excl. VAT).\n\n${Q_NEED}`;
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
    const rec = recommendPackage(session);
    return (
      `Based on what you shared, I'd steer you to *${rec.name}* — ${rec.price}.\n\n` +
      `${rec.why}\n${rec.url}\n\n` +
      `Soft close: email ${email} or WhatsApp ${phone} and we'll lock scope.\n\n` +
      `Want me to compare Starter vs Growth on that line?`
    );
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

  const rec = recommendPackage(session);
  return (
    `Happy to help further. Best fit right now: *${rec.name}* (${rec.price}).\n` +
    `Reach ${email} / ${phone} · ${site}`
  );
}
