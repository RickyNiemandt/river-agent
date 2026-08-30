#!/usr/bin/env node
/**
 * River Agent — local Path Direct (Windows: C:\Ecolife\RiverBot)
 * Zero npm deps. Node 20+.
 *
 *   copy .dev.vars.example .dev.vars   # set D360_API_KEY, DRY_RUN=false
 *   npm run local                       # http://127.0.0.1:8791
 *
 * Hub needs a public HTTPS URL. In a second terminal:
 *   npm run tunnel                      # prints https://….trycloudflare.com
 * Hub webhook = that URL + /webhook
 *
 * Env: PORT (default 8791), DRY_RUN, D360_API_KEY, D360_API_BASE
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8791);

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

const env = {
  DRY_RUN: "true",
  D360_API_KEY: "",
  D360_API_BASE: "https://waba-v2.360dialog.io",
  SEND_AUTH_TOKEN: "",
  SALES_CONTACT_EMAIL: "ceo@charmsystemsllc.com",
  SALES_CONTACT_PHONE: "+27726064522",
  PUBLIC_SITE: "https://charmsystemsllc.com/",
  BRAND_NAME: "EcoLife Automation / Charm Systems",
};

function refreshEnv() {
  const fileEnv = {
    ...loadDotVars(resolve(ROOT, ".env")),
    ...loadDotVars(resolve(ROOT, ".dev.vars")),
  };
  env.DRY_RUN = fileEnv.DRY_RUN ?? process.env.DRY_RUN ?? "true";
  env.D360_API_KEY = (
    process.env.D360_API_KEY ||
    fileEnv.D360_API_KEY ||
    ""
  ).trim();
  env.D360_API_BASE =
    process.env.D360_API_BASE ??
    fileEnv.D360_API_BASE ??
    "https://waba-v2.360dialog.io";
  env.SEND_AUTH_TOKEN =
    process.env.SEND_AUTH_TOKEN ?? fileEnv.SEND_AUTH_TOKEN ?? "";
  env.SALES_CONTACT_EMAIL =
    process.env.SALES_CONTACT_EMAIL ??
    fileEnv.SALES_CONTACT_EMAIL ??
    "ceo@charmsystemsllc.com";
  env.SALES_CONTACT_PHONE =
    process.env.SALES_CONTACT_PHONE ??
    fileEnv.SALES_CONTACT_PHONE ??
    "+27726064522";
  env.PUBLIC_SITE =
    process.env.PUBLIC_SITE ??
    fileEnv.PUBLIC_SITE ??
    "https://charmsystemsllc.com/";
  env.BRAND_NAME =
    process.env.BRAND_NAME ??
    fileEnv.BRAND_NAME ??
    "EcoLife Automation / Charm Systems";
}

refreshEnv();

function isDryRun() {
  refreshEnv();
  return String(env.DRY_RUN ?? "true").toLowerCase() !== "false";
}

const Q_NEED = "What are you trying to fix or grow right now?";
const Q_TIMELINE = "When do you want this live?";
const Q_FIT =
  "Are you a solo founder, an agency/team, or an ecommerce brand?";
const GREETING_RE =
  /^(hi|h+i+|hello|hey|howz?it|howzit|good\s*(morning|afternoon|evening)|sawubona|hola|whats?\s*up|test)\b/i;

function isGreetingOnly(text) {
  if (!text) return true;
  const t = String(text).trim();
  if (!t) return true;
  return t.length <= 24 && GREETING_RE.test(t);
}

function recommendPackage(session) {
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
    /linkedin|invisible|get\s*found|outreach|website\s*and\s*linkedin/.test(
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
  if (/agency|team|multi|packages|routing|dashboard|growth\s*bot/.test(blob)) {
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

function createSession(wa_id, profile_name) {
  const now = new Date().toISOString();
  return {
    wa_id,
    profile_name,
    stage: "need",
    message_count: 0,
    created_at: now,
    updated_at: now,
  };
}

function advanceStage(session, text) {
  const next = { ...session };
  const now = new Date().toISOString();
  next.updated_at = now;
  next.last_inbound_at = now;
  next.message_count = (session.message_count ?? 0) + 1;
  if (!text) return next;
  const t = String(text).trim();
  if (!t) return next;
  const stage = session.stage;
  if (stage === "need" && !session.need) {
    if (isGreetingOnly(t)) return next;
    next.need = t.slice(0, 500);
    next.stage = "timeline";
  } else if (stage === "timeline" && !session.timeline) {
    next.timeline = t.slice(0, 500);
    next.stage = "fit";
  } else if (stage === "fit" && !session.fit) {
    next.fit = t.slice(0, 500);
    next.stage = "recommend";
  } else if (stage === "recommend") {
    next.stage = "done";
  }
  return next;
}

function buildSalesReply(session, inboundText, previousStage) {
  const email = env.SALES_CONTACT_EMAIL;
  const phone = env.SALES_CONTACT_PHONE;
  const site = env.PUBLIC_SITE;
  const name = session.profile_name?.split(/\s+/)[0];
  const hi = name ? `Hi ${name}` : "Hi";

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
  if (session.stage === "recommend" || (previousStage === "fit" && session.fit)) {
    const rec = recommendPackage(session);
    return (
      `Based on what you shared, I'd steer you to *${rec.name}* — ${rec.price}.\n\n` +
      `${rec.why}\n${rec.url}\n\n` +
      `Soft close: email ${email} or WhatsApp ${phone} and we'll lock scope.\n\n` +
      `Want me to compare Starter vs Growth on that line?`
    );
  }
  if (session.stage === "need") return Q_NEED;
  if (session.stage === "timeline") return Q_TIMELINE;
  if (session.stage === "fit") return Q_FIT;
  const rec = recommendPackage(session);
  return `Happy to help further. Best fit right now: *${rec.name}* (${rec.price}).\nReach ${email} / ${phone} · ${site}`;
}

function extractInboundMessages(body) {
  const out = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;
      if (!Array.isArray(value.messages) || value.messages.length === 0) {
        continue;
      }
      const contactByWa = new Map(
        (value.contacts ?? []).map((c) => [c.wa_id ?? "", c]),
      );
      for (const msg of value.messages ?? []) {
        if (!msg?.id || !msg.from) continue;
        const wa_id = msg.from;
        const contact = contactByWa.get(wa_id);
        const type = msg.type ?? "unknown";
        const text =
          type === "text" && msg.text?.body ? String(msg.text.body) : undefined;
        out.push({
          id: msg.id,
          from: msg.from,
          wa_id,
          profile_name: contact?.profile?.name,
          timestamp: msg.timestamp ?? String(Math.floor(Date.now() / 1000)),
          type,
          text,
        });
      }
    }
  }
  return out;
}

const sessions = new Map();
const seenIds = new Set();
const inboundLog = [];
const MAX_LOG = 40;

function pushLog(entry) {
  inboundLog.unshift({ at: new Date().toISOString(), ...entry });
  if (inboundLog.length > MAX_LOG) inboundLog.length = MAX_LOG;
}

async function sendTextMessage(to, text) {
  refreshEnv();
  if (isDryRun()) {
    console.log("[DRY_RUN] would send WhatsApp text", { to, text });
    return { ok: true, dry_run: true, body: { to, text } };
  }
  const apiKey = env.D360_API_KEY;
  if (!apiKey) {
    return { ok: false, dry_run: false, error: "D360_API_KEY not configured" };
  }
  const base = env.D360_API_BASE.replace(/\/$/, "");
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: text, preview_url: false },
  };
  try {
    const res = await fetch(`${base}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "D360-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    });
    const raw = await res.text();
    let parsed = raw;
    try {
      parsed = JSON.parse(raw);
    } catch {
      /* keep */
    }
    if (!res.ok) {
      console.error("360dialog send failed", res.status, parsed);
      return {
        ok: false,
        dry_run: false,
        status: res.status,
        body: parsed,
        error: `360dialog HTTP ${res.status}`,
      };
    }
    return { ok: true, dry_run: false, status: res.status, body: parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("360dialog send error", message);
    return { ok: false, dry_run: false, error: message };
  }
}

async function processInbound(message) {
  if (seenIds.has(message.id)) {
    console.log("dedupe skip", message.id);
    return;
  }
  seenIds.add(message.id);

  let session = sessions.get(message.wa_id);
  if (!session) session = createSession(message.wa_id, message.profile_name);
  else if (message.profile_name && !session.profile_name) {
    session.profile_name = message.profile_name;
  }
  const previousStage = session.stage;
  session = advanceStage(session, message.text);
  sessions.set(message.wa_id, session);

  const text = buildSalesReply(session, message.text, previousStage);
  const send = await sendTextMessage(message.wa_id, text);
  pushLog({
    kind: "message",
    from: message.wa_id,
    name: message.profile_name,
    text: message.text,
    stage: session.stage,
    reply_ok: send.ok,
    dry_run: send.dry_run,
    reply_preview: text.slice(0, 160),
    send_error: send.error || null,
  });
  console.log("local sales reply", {
    dry_run: send.dry_run,
    ok: send.ok,
    to: message.wa_id,
    stage: session.stage,
    error: send.error,
  });
}

function json(res, data, status = 200) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      resolveBody(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function extractBearer(req) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1]?.trim() || null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  try {
    if (req.method === "GET" && (path === "/" || path === "/health")) {
      return json(res, {
        service: "river-agent-local",
        ok: true,
        dry_run: isDryRun(),
        reply_mode: "worker",
        messaging_api_configured: Boolean(env.D360_API_KEY),
        blocked:
          env.D360_API_KEY && !isDryRun()
            ? null
            : "D360_API_KEY empty or DRY_RUN=true — inbound logged, WhatsApp not sent",
        inbound_count: inboundLog.filter((e) => e.kind === "message").length,
        last_inbound: inboundLog[0] || null,
        smoke_whatsapp: "https://wa.me/27726064522",
        checkout: "C:\\Ecolife\\RiverBot",
        sales: {
          contact_email: env.SALES_CONTACT_EMAIL,
          contact_phone: env.SALES_CONTACT_PHONE,
        },
      });
    }

    if (req.method === "GET" && path === "/inbox") {
      const rows = inboundLog
        .map(
          (e) =>
            `<tr><td>${e.at}</td><td>${e.kind}</td><td>${e.from || ""}</td><td>${(e.text || e.note || "").toString().slice(0, 80)}</td><td>${e.stage || ""}</td><td>${e.dry_run === true ? "dry-run" : e.reply_ok === false ? "send-fail" : e.kind === "message" ? "ok" : ""}</td></tr>`,
        )
        .join("");
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="5"><title>River Agent inbox</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;background:#0f1412;color:#e8efe9}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #2a332d;padding:8px;text-align:left;font-size:14px}a{color:#7dcea0}</style></head>
<body><h1>River Agent inbound</h1>
<p>dry_run=${isDryRun()} · messaging_api=${Boolean(env.D360_API_KEY)} · <a href="https://wa.me/27726064522">wa.me/27726064522</a></p>
<p>Hub webhook: <code>/webhook</code> · refreshes every 5s</p>
<table><thead><tr><th>at</th><th>kind</th><th>from</th><th>text</th><th>stage</th><th>send</th></tr></thead><tbody>${rows || "<tr><td colspan=6>No inbound yet. Point Hub here, then WhatsApp the business number.</td></tr>"}</tbody></table></body></html>`;
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      });
      return res.end(html);
    }

    if (req.method === "GET" && path === "/webhook") {
      res.writeHead(200, { "content-type": "text/plain" });
      return res.end("OK");
    }

    if (req.method === "POST" && path === "/webhook") {
      const raw = await readBody(req);
      let body;
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        res.writeHead(200, { "content-type": "text/plain" });
        return res.end("OK");
      }
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("OK");
      const inbound = extractInboundMessages(body);
      if (inbound.length === 0) {
        pushLog({ kind: "status_or_empty", note: "no messages in payload" });
      }
      for (const message of inbound) {
        try {
          await processInbound(message);
        } catch (err) {
          console.error("processInbound failed", message.id, err);
        }
      }
      return;
    }

    if (req.method === "POST" && path === "/send") {
      const expected = env.SEND_AUTH_TOKEN;
      if (!expected) {
        return json(
          res,
          { error: "send_auth_not_configured", hint: "Set SEND_AUTH_TOKEN" },
          503,
        );
      }
      const token = extractBearer(req);
      if (!token || token !== expected) {
        return json(res, { error: "unauthorized" }, 401);
      }
      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return json(res, { error: "invalid_json" }, 400);
      }
      const to = String(body.to || "").trim();
      const text = String(body.text ?? body.body ?? "").trim();
      if (!to || !text) return json(res, { error: "to_and_text_required" }, 400);
      const result = await sendTextMessage(to, text);
      return json(res, result, result.ok ? 200 : 502);
    }

    return json(res, { error: "not_found", path }, 404);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) json(res, { error: "internal" }, 500);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`River Agent local on http://127.0.0.1:${PORT}`);
  console.log(`  dry_run=${isDryRun()}  messaging_api=${Boolean(env.D360_API_KEY)}`);
  console.log("  Hub webhook path: /webhook");
  console.log("  Public URL: npm run tunnel   (then set Hub to https://…/webhook)");
});
