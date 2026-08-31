#!/usr/bin/env node
/**
 * Keep a Cloudflare quick-tunnel alive and keep Hub pointed at it.
 *
 * trycloudflare hostnames die (often after hours). This process:
 *   1) GET local /health
 *   2) GET public /health for the saved + Hub URL
 *   3) if public is dead: restart cloudflared, write .tunnel-url, POST Hub webhook
 *
 * Does not print D360_API_KEY.
 *
 *   npm run watch-tunnel
 *
 * Env: PORT (default 8791), WATCH_TUNNEL_MS (default 45000)
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.PORT || "8791";
const LOCAL = `http://127.0.0.1:${PORT}`;
const INTERVAL_MS = Number(process.env.WATCH_TUNNEL_MS || 45000);
const STATE = resolve(ROOT, ".tunnel-url");
const URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

function loadDotVars(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function apiKey() {
  const file = {
    ...loadDotVars(resolve(ROOT, ".env")),
    ...loadDotVars(resolve(ROOT, ".dev.vars")),
  };
  return String(process.env.D360_API_KEY || file.D360_API_KEY || "").trim();
}

function apiBase() {
  const file = {
    ...loadDotVars(resolve(ROOT, ".env")),
    ...loadDotVars(resolve(ROOT, ".dev.vars")),
  };
  return String(
    process.env.D360_API_BASE ||
      file.D360_API_BASE ||
      "https://waba-v2.360dialog.io",
  ).replace(/\/$/, "");
}

function readSavedHost() {
  if (!existsSync(STATE)) return "";
  return readFileSync(STATE, "utf8").trim().replace(/\/$/, "");
}

function writeSavedHost(host) {
  writeFileSync(STATE, `${host.replace(/\/$/, "")}\n`, "utf8");
}

function hostFromWebhook(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

async function fetchJson(url, ms = 8000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep */
  }
  return { ok: res.ok, status: res.status, body };
}

async function healthOk(origin) {
  try {
    const r = await fetchJson(`${origin.replace(/\/$/, "")}/health`, 8000);
    const svc = r.body && typeof r.body === "object" ? r.body.service : "";
    return Boolean(r.ok && svc);
  } catch {
    return false;
  }
}

async function d360(method, path, body) {
  const key = apiKey();
  if (!key) throw new Error("D360_API_KEY empty");
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "D360-API-KEY": key,
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

async function hubWebhookUrl() {
  const r = await d360("GET", "/v1/configs/webhook");
  if (!r.ok || !r.body || typeof r.body !== "object") return "";
  return String(r.body.url || "");
}

async function setHub(webhookUrl) {
  const set = await d360("POST", "/v1/configs/webhook", { url: webhookUrl });
  if (!set.ok) {
    throw new Error(`Hub webhook POST HTTP ${set.status}`);
  }
  console.log("watch-tunnel: Hub primary set to", webhookUrl);
}

function killOldTunnels() {
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/F", "/IM", "cloudflared.exe"], { stdio: "ignore" });
    } else {
      spawn(
        "pkill",
        ["-f", `cloudflared tunnel --url http://127.0.0.1:${PORT}`],
        { stdio: "ignore" },
      );
    }
  } catch {
    /* ignore */
  }
}

function startCloudflared() {
  const win = process.platform === "win32";
  return spawn("npx", ["--yes", "cloudflared", "tunnel", "--url", LOCAL], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    shell: win,
  });
}

function waitForTunnelUrl(child, ms = 90000) {
  return new Promise((resolveUrl, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("cloudflared did not print a trycloudflare URL"));
    }, ms);
    function onData(chunk) {
      buf += String(chunk);
      const m = buf.match(URL_RE);
      if (m) {
        cleanup();
        resolveUrl(m[0].replace(/\/$/, ""));
      }
    }
    function onExit(code) {
      cleanup();
      reject(new Error(`cloudflared exited ${code}`));
    }
    function cleanup() {
      clearTimeout(timer);
      child.stdout?.off("data", onData);
      child.stderr?.off("data", onData);
      child.off("exit", onExit);
    }
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", onExit);
  });
}

let cloudflaredChild = null;
let repairing = false;

async function repair() {
  if (repairing) return;
  repairing = true;
  console.log("watch-tunnel: public tunnel dead — restarting quick-tunnel");
  try {
    if (cloudflaredChild && !cloudflaredChild.killed) {
      cloudflaredChild.kill("SIGTERM");
    }
    killOldTunnels();
    await new Promise((r) => setTimeout(r, 1500));
    cloudflaredChild = startCloudflared();
    cloudflaredChild.on("exit", (code) => {
      console.log("watch-tunnel: cloudflared exit", code);
      cloudflaredChild = null;
    });
    const host = await waitForTunnelUrl(cloudflaredChild);
    writeSavedHost(host);
    console.log("watch-tunnel: new host", host);
    const healthy = await healthOk(host);
    if (!healthy) throw new Error("new tunnel /health failed");
    await setHub(`${host}/webhook`);
  } finally {
    repairing = false;
  }
}

async function tick() {
  const localUp = await healthOk(LOCAL);
  if (!localUp) {
    console.error("watch-tunnel: local Path down at", `${LOCAL}/health`);
    return;
  }

  const saved = readSavedHost();
  let hub = "";
  try {
    hub = hostFromWebhook(await hubWebhookUrl());
  } catch (err) {
    console.error(
      "watch-tunnel: Hub GET failed",
      err instanceof Error ? err.message : err,
    );
  }

  const candidates = [...new Set([saved, hub].filter(Boolean))];
  for (const origin of candidates) {
    if (await healthOk(origin)) {
      writeSavedHost(origin);
      const want = `${origin}/webhook`;
      try {
        const current = await hubWebhookUrl();
        if (current !== want) await setHub(want);
      } catch (err) {
        console.error(
          "watch-tunnel: Hub set failed",
          err instanceof Error ? err.message : err,
        );
      }
      return;
    }
  }

  await repair();
}

console.log(
  `watch-tunnel: local=${LOCAL} interval=${INTERVAL_MS}ms (does not print API key)`,
);

tick().catch((err) => {
  console.error("watch-tunnel:", err instanceof Error ? err.message : err);
});
setInterval(() => {
  tick().catch((err) => {
    console.error("watch-tunnel:", err instanceof Error ? err.message : err);
  });
}, INTERVAL_MS);
