import type { CursorWakePayload, Env, InboundMessage, SessionState } from "./types";
import { isDryRun } from "./util";

export interface WakeResult {
  ok: boolean;
  dry_run: boolean;
  status?: number;
  error?: string;
}

export function buildWakePayload(
  env: Env,
  message: InboundMessage,
  session: SessionState,
): CursorWakePayload {
  return {
    source: "river-agent-doorbell",
    event: "whatsapp_inbound",
    dry_run: isDryRun(env),
    received_at: new Date().toISOString(),
    brand: env.BRAND_NAME || "EcoLife Automation / Charm Systems",
    public_site: env.PUBLIC_SITE || "https://charmsystemsllc.com/",
    sales: {
      contact_email: env.SALES_CONTACT_EMAIL || "ceo@charmsystemsllc.com",
      contact_phone: env.SALES_CONTACT_PHONE || "+27726064522",
      mode: "sell_only",
    },
    message: {
      id: message.id,
      from: message.from,
      wa_id: message.wa_id,
      profile_name: message.profile_name,
      timestamp: message.timestamp,
      type: message.type,
      text: message.text,
    },
    session,
    reply: {
      primary: "360dialog_mcp",
      mcp_url: "https://mcp.360dialog.com/mcp",
      mcp_tools: [
        "list_conversations",
        "send_message",
        "get_messages",
        "label_conversation",
      ],
      note: "Sales-only: reply with 360dialog MCP send_message (Hub OAuth). Qualify need→timeline→fit then recommend a package. Do not book calendar. Worker /send is optional Messaging API fallback only.",
      fallback_send_path: "/send",
      fallback_note:
        "Only if MCP send fails: POST { to, text } with Authorization: Bearer <SEND_AUTH_TOKEN or CURSOR_API_KEY>.",
    },
  };
}

export async function wakeCursorAutomation(
  env: Env,
  payload: CursorWakePayload,
): Promise<WakeResult> {
  if (isDryRun(env)) {
    console.log("[DRY_RUN] would wake Cursor Automation", JSON.stringify(payload));
    return { ok: true, dry_run: true };
  }

  const url = env.CURSOR_WEBHOOK_URL;
  const apiKey = env.CURSOR_API_KEY;
  if (!url || !apiKey) {
    return {
      ok: false,
      dry_run: false,
      error: "CURSOR_WEBHOOK_URL or CURSOR_API_KEY not configured",
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "river-agent-doorbell/0.1",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Cursor wake failed", res.status, errText.slice(0, 500));
      return {
        ok: false,
        dry_run: false,
        status: res.status,
        error: `Cursor webhook HTTP ${res.status}`,
      };
    }
    return { ok: true, dry_run: false, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cursor wake error", message);
    return { ok: false, dry_run: false, error: message };
  }
}
