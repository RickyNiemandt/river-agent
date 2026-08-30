#!/usr/bin/env node
/**
 * Start a Cloudflare quick-tunnel to the local River Agent server.
 * Requires cloudflared on PATH, or uses npx --yes cloudflared.
 *
 *   npm run local          # terminal 1
 *   npm run tunnel         # terminal 2 — copy https://….trycloudflare.com
 * Hub webhook = that URL + /webhook
 */
import { spawn } from "node:child_process";

const port = process.env.PORT || "8791";
const url = `http://127.0.0.1:${port}`;
const args = ["tunnel", "--url", url];

function viaNpx() {
  console.log("cloudflared not on PATH — trying npx --yes cloudflared");
  const child = spawn("npx", ["--yes", "cloudflared", ...args], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 1));
}

const fromPath = spawn("cloudflared", args, { stdio: "inherit" });
fromPath.on("error", viaNpx);
fromPath.on("exit", (code) => {
  if (code === 0) process.exit(0);
});
