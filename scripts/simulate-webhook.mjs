#!/usr/bin/env node
/**
 * POST a sample 360dialog-style inbound text webhook to local wrangler dev.
 * Usage: npm run test:webhook
 * Optional: WEBHOOK_URL=http://127.0.0.1:8787/webhook npm run test:webhook
 */
const url = process.env.WEBHOOK_URL || "http://127.0.0.1:8787/webhook";
const waId = process.env.WA_ID || "27721234567";
const text = process.env.TEXT || "Hi — interested in River Agent for our agency";

const payload = {
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
            contacts: [
              {
                profile: { name: "Test Lead" },
                wa_id: waId,
              },
            ],
            messages: [
              {
                from: waId,
                id: `wamid.test.${Date.now()}`,
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

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

console.log(res.status, await res.text());
