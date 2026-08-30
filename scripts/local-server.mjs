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
