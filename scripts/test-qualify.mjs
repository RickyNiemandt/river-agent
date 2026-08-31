#!/usr/bin/env node
/**
 * Qualify Path Local: headcount Fit, Hi/rest reset, three products, no Custom Automation.
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

async function runPass(label) {
  const shop = `27${Date.now().toString().slice(-8)}${label.length}`;
  let last = await send(shop, "Shop Lead", "Hi");
  assert(preview(last).includes("Howzit"), preview(last));
  assert(preview(last).includes("Get Found"), preview(last));
  assert(preview(last).includes("Hi or rest"), preview(last));

  last = await send(shop, "Shop Lead", "I need a Shopify store with PayFast");
  assert(last.stage === "timeline", `${label} stage ${last.stage}`);

  last = await send(shop, "Shop Lead", "this week");
  assert(last.stage === "fit", `${label} stage ${last.stage}`);
  assert(preview(last).includes("just you"), preview(last));

  last = await send(shop, "Shop Lead", "11+");
  assert(last.stage === "recommend", `${label} stage ${last.stage}`);
  assert(preview(last).includes("Get Selling"), preview(last));
  assert(preview(last).includes("Scale Store"), preview(last));
  assert(!preview(last).includes("Custom Automation"), preview(last));
  assert(preview(last).includes("hot enquiry"), preview(last));

  last = await send(shop, "Shop Lead", "rest");
  assert(last.stage === "need", `${label} rest stage ${last.stage}`);
  assert(preview(last).includes("What are you trying"), preview(last));

  const found = `28${Date.now().toString().slice(-8)}${label.length}`;
  await send(found, "LinkedIn Lead", "Hi");
  await send(found, "LinkedIn Lead", "Invisible on LinkedIn, need leads");
  await send(found, "LinkedIn Lead", "later this year");
  last = await send(found, "LinkedIn Lead", "just me");
  assert(preview(last).includes("Get Found"), preview(last));
  assert(preview(last).includes("Starter"), preview(last));

  const river = `29${Date.now().toString().slice(-8)}${label.length}`;
  await send(river, "River Lead", "Hi");
  await send(river, "River Lead", "WhatsApp bot to qualify leads");
  await send(river, "River Lead", "this month");
  last = await send(river, "River Lead", "2-10");
  assert(preview(last).includes("River Agent"), preview(last));
  assert(preview(last).includes("Growth Bot"), preview(last));
  assert(!preview(last).includes("custom-automation"), preview(last));

  return { shop, found, river };
}

const first = await runPass("a");
const second = await runPass("b");

const health = await fetch(healthUrl).then((r) => r.json());
assert(JSON.stringify(health.products).includes("Get Selling"), "products");

console.log("test-qualify ok", {
  first,
  second,
  products: health.products,
});
