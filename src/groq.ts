import type { Env, SessionState } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/** Compact site facts — Get Found, Get Selling, River Agent only. Prices excl. VAT. */
export const PRODUCT_PACK = `You are River Agent for EcoLife Automation (charmsystemsllc.com). Sell ONLY these three lines. Prices excl. VAT. No calendar. Never recommend Custom Automation.

River Agent (WhatsApp sales AI) — https://charmsystemsllc.com/
- Starter Bot R5,500/mo — solo founders, coaches, single-service
- Growth Bot R9,999/mo (best value) — agencies / multi-package; scoring; priority support
Includes: bot setup, form integration, WhatsApp Business setup if needed, templates, training, deploy, lead tracking.
Not included: Shopify/Woo fees, Meta WhatsApp API credits.

Get Found — https://charmsystemsllc.com/get-found
Website + LinkedIn engine.
- Starter R4,500/mo — site + 8 LinkedIn posts/mo
- Growth R9,500/mo — +50 outreach DMs/mo, strategy call, dashboard
- Scale R18,000/mo — +150 outreach/mo
Growth/Scale: 60-day lead guarantee.

Get Selling — https://charmsystemsllc.com/get-selling
Shopify/Woo; PayFast/Yoco; platform fees excluded.
- Starter Store R18,000 build + R2,900/mo (~50 products)
- Growth Store R38,000 build + R5,900/mo (~200 products)
- Scale Store from R65,000 build + R11,900/mo

Routing: WhatsApp/qualify → River Agent. Invisible/LinkedIn → Get Found. Store/checkout → Get Selling.
Soft close: ceo@charmsystemsllc.com or +27 72 606 4522.
One primary package. Short WhatsApp bubble. If unsure, link the product page. Never invent prices.`;

export async function groqFollowUp(
  env: Env,
  session: SessionState,
  inboundText: string | undefined,
): Promise<string | null> {
  const key = env.GROQ_API_KEY?.trim();
  if (!key) return null;
  const user = (inboundText || "").trim();
  if (!user) return null;

  const system = `${PRODUCT_PACK}

Current lead:
- name: ${session.profile_name || "unknown"}
- need: ${session.need || ""}
- timeline: ${session.timeline || ""}
- fit: ${session.fit || ""}
- recommended: ${session.package_hint || "not yet scored"}
- score: ${session.score ?? "?"}/10 (${session.temperature || "?"})`;

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 4000);
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user.slice(0, 800) },
        ],
      }),
      signal: ac.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error("groq http", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    return text.slice(0, 900);
  } catch (err) {
    console.error("groq follow-up failed", err);
    return null;
  }
}
