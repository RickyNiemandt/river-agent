#!/usr/bin/env node
/**
 * Point 360dialog channel webhook at River Agent, then optionally smoke-send.
 *
 * Requires D360_API_KEY in .dev.vars or env.
 *
 *   npm run go-live
 *   set WEBHOOK_URL=https://….trycloudflare.com/webhook
 *   SMOKE_TO=27726064522 npm run go-live
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (
  process.env.D360_API_BASE || "https://waba-v2.360dialog.io"
).replace(/\/$/, "");
const DEFAULT_WEBHOOK =
  process.env.WEBHOOK_URL ||
  "https://ridge-ensemble-seminar-hurricane.trycloudflare.com/webhook";

function loadDotVars(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const fileEnv = {
  ...loadDotVars(resolve(ROOT, ".env")),
  ...loadDotVars(resolve(ROOT, ".dev.vars")),
};
const apiKey = process.env.D360_API_KEY || fileEnv.D360_API_KEY || "";
const webhookUrl = DEFAULT_WEBHOOK;

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

if (!apiKey) {
  die(
    [
      "D360_API_KEY is empty — cannot set Hub webhook or send WhatsApp.",
      "",
      "Hub → channel → copy Messaging API key.",
      "Then either:",
      "  1) Paste it into .dev.vars as D360_API_KEY=… and run: npm run go-live",
      "  2) Paste the key in the Cloud Agent chat",
      "",
      `Target webhook: ${webhookUrl}`,
    ].join("\n"),
  );
}

async function d360(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "D360-API-KEY": apiKey,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* keep */
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

console.log("360dialog base:", BASE);
console.log("Webhook target:", webhookUrl);

const before = await d360("GET", "/v1/configs/webhook");
console.log("GET webhook", before.status, JSON.stringify(before.body));

const set = await d360("POST", "/v1/configs/webhook", { url: webhookUrl });
console.log("POST webhook", set.status, JSON.stringify(set.body));
if (!set.ok) {
  die(`Failed to set webhook (HTTP ${set.status}). Check D360_API_KEY.`);
}

const after = await d360("GET", "/v1/configs/webhook");
console.log("GET webhook after", after.status, JSON.stringify(after.body));

const smokeTo = (process.env.SMOKE_TO || "").replace(/\D/g, "");
if (smokeTo) {
  const send = await d360("POST", "/messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: smokeTo,
    type: "text",
    text: {
      body: "River Agent go-live smoke: Messaging API send works. Reply on this number to test inbound.",
      preview_url: false,
    },
  });
  console.log("SMOKE send", send.status, JSON.stringify(send.body));
  if (!send.ok) die(`Smoke send failed (HTTP ${send.status}).`);
} else {
  console.log("Skip smoke send (set SMOKE_TO=27… to send a real WhatsApp).");
}

console.log("Go-live webhook step done. WhatsApp the business number next.");
