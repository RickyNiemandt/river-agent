import type { Env } from "./types";
import { isDryRun } from "./util";

export interface SendTextResult {
  ok: boolean;
  dry_run: boolean;
  status?: number;
  body?: unknown;
  error?: string;
}

/**
 * Send WhatsApp text via 360dialog Messaging API.
 * Official mcp.360dialog.com is Hub-admin only — customer chat uses this API
 * (Worker Path Direct, River MCP /mcp, or POST /send).
 * Needs D360_API_KEY (channel Messaging API key).
 * Docs: POST https://waba-v2.360dialog.io/messages
 */
export async function sendTextMessage(
  env: Env,
  to: string,
  body: string,
): Promise<SendTextResult> {
  if (isDryRun(env)) {
    console.log("[DRY_RUN] would send WhatsApp text", { to, body });
    return { ok: true, dry_run: true, body: { to, text: body } };
  }

  const apiKey = env.D360_API_KEY;
  if (!apiKey) {
    return { ok: false, dry_run: false, error: "D360_API_KEY not configured" };
  }

  const base = (env.D360_API_BASE || "https://waba-v2.360dialog.io").replace(
    /\/$/,
    "",
  );

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body, preview_url: false },
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
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* keep text */
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
