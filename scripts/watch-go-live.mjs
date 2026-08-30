#!/usr/bin/env node
/**
 * Wait until D360_API_KEY appears in env or .dev.vars, then set Hub webhook.
 * Does not print the key. Safe to leave running on the laptop or this VM.
 *
 *   npm run watch-go-live
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INTERVAL_MS = Number(process.env.WATCH_MS || 4000);

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

function currentKey() {
  const file = {
    ...loadDotVars(resolve(ROOT, ".env")),
    ...loadDotVars(resolve(ROOT, ".dev.vars")),
  };
  return String(process.env.D360_API_KEY || file.D360_API_KEY || "").trim();
}

function runGoLive() {
  return new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, ["scripts/go-live.mjs"], {
      cwd: ROOT,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => resolveExit(code ?? 1));
  });
}

console.log(
  "watch-go-live: waiting for D360_API_KEY in .dev.vars or env (not printed).",
);

let running = false;
async function tick() {
  if (running) return;
  const key = currentKey();
  if (!key) return;
  running = true;
  const varsPath = resolve(ROOT, ".dev.vars");
  if (existsSync(varsPath)) {
    const raw = readFileSync(varsPath, "utf8");
    if (/^DRY_RUN=/m.test(raw)) {
      writeFileSync(
        varsPath,
        raw.replace(/^DRY_RUN=.*$/m, "DRY_RUN=false"),
        "utf8",
      );
    }
  }
  console.log("watch-go-live: key present — running npm run go-live");
  const code = await runGoLive();
  if (code === 0) {
    console.log("watch-go-live: Hub webhook step finished.");
    process.exit(0);
  }
  console.error("watch-go-live: go-live exited", code, "— will retry.");
  running = false;
}

setInterval(() => {
  tick().catch((err) => {
    console.error("watch-go-live:", err instanceof Error ? err.message : err);
    running = false;
  });
}, INTERVAL_MS);
tick().catch((err) => {
  console.error(err);
});
