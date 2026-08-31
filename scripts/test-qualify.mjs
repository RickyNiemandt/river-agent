#!/usr/bin/env node
/**
 * Qualify Path Local: Need → Timeline → Fit, three products, Hi reset, no Custom Automation.
 *
 *   PORT=8794 DRY_RUN=true node scripts/local-server.mjs
 *   WEBHOOK_URL=http://127.0.0.1:8794/webhook node scripts/test-qualify.mjs
 */
const url = process.env.WEBHOOK_URL || "http://127.0.0.1:8794/webhook";
const healthUrl = url.replace(/\/webhook\/?$/, "/health");

function payload(waId, name, text) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_TEST",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "27000000000",
                phone_number_id: "PHONE_NUMBER_ID_TEST",
              },
              contacts: [{ profile: { name }, wa_id: waId }],
              messages: [
                {
                  from: waId,
                  id: `wamid.test.${Date.now()}.${Math.random().toString(16).slice(2)}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: "text",
                  text: { body: text },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

async function send(waId, name, text) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload(waId, name, text)),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
  const health = await fetch(healthUrl).then((r) => r.json());
  return health.last_inbound;
}

function preview(last) {
  return String(last?.reply_preview || "");
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const shop = `27${Date.now().toString().slice(-9)}`;
let last = await send(shop, "Shop Lead", "Hi");
assert(preview(last).includes("Get Found"), preview(last));
assert(preview(last).includes("What are you trying"), preview(last));

last = await send(shop, "Shop Lead", "I need a Shopify store with PayFast");
assert(last.stage === "timeline", `stage ${last.stage}`);

last = await send(shop, "Shop Lead", "this week");
assert(last.stage === "fit", `stage ${last.stage}`);

last = await send(shop, "Shop Lead", "ecommerce brand");
assert(last.stage === "recommend", `stage ${last.stage}`);
assert(preview(last).includes("Get Selling"), preview(last));
assert(!preview(last).includes("Custom Automation"), preview(last));
assert(preview(last).includes("hot enquiry"), preview(last));

last = await send(shop, "Shop Lead", "Hi");
assert(last.stage === "need", `reset stage ${last.stage}`);
assert(preview(last).includes("What are you trying"), preview(last));

const pdf = `28${Date.now().toString().slice(-9)}`;
await send(pdf, "Pdf Lead", "Hi");
await send(pdf, "Pdf Lead", "PDF workflow automation glue");
await send(pdf, "Pdf Lead", "this month");
last = await send(pdf, "Pdf Lead", "agency team");
assert(preview(last).includes("River Agent"), preview(last));
assert(!preview(last).includes("Custom Automation"), preview(last));
assert(!preview(last).includes("custom-automation"), preview(last));

const found = `29${Date.now().toString().slice(-9)}`;
await send(found, "LinkedIn Lead", "Hi");
await send(found, "LinkedIn Lead", "Invisible on LinkedIn, need leads");
await send(found, "LinkedIn Lead", "later this year");
last = await send(found, "LinkedIn Lead", "solo founder");
assert(preview(last).includes("Get Found"), preview(last));

const health = await fetch(healthUrl).then((r) => r.json());
assert(health.groq_configured === false || typeof health.groq_configured === "boolean", "groq flag");
assert(JSON.stringify(health.products).includes("Get Selling"), "products");

console.log("test-qualify ok", {
  shop: shop,
  last_shop_reset: "need",
  products: health.products,
  groq_configured: health.groq_configured,
});
