import { wakeCursorAutomation, buildWakePayload } from "./cursor";
import { sendTextMessage } from "./d360";
import { isDuplicate } from "./dedupe";
import { checkRateLimit } from "./rate-limit";
import {
  advanceStage,
  createSession,
  getSession,
  saveSession,
} from "./session";
import type { Env, InboundMessage } from "./types";
import {
  extractBearer,
  isDryRun,
  json,
  ok,
  timingSafeEqual,
} from "./util";
import { extractInboundMessages } from "./webhook";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && (path === "/" || path === "/health")) {
      return json({
        service: "river-agent-doorbell",
        ok: true,
        dry_run: isDryRun(env),
        reply_primary: "360dialog_mcp",
        mcp_url: "https://mcp.360dialog.com/mcp",
        mode: "sell_only",
        messaging_api_fallback: Boolean(env.D360_API_KEY),
        kv: env.RIVER_KV ? "bound" : "memory",
        sales: {
          contact_email: env.SALES_CONTACT_EMAIL,
          contact_phone: env.SALES_CONTACT_PHONE,
        },
      });
    }

    // 360dialog may GET for URL verification in some setups
    if (request.method === "GET" && path === "/webhook") {
      return ok();
    }

    if (request.method === "POST" && path === "/webhook") {
      // Acknowledge ASAP — process in background (360dialog expects ~200 quickly)
      ctx.waitUntil(handleWebhook(request, env));
      return ok();
    }

    if (request.method === "POST" && path === "/send") {
      return handleSend(request, env);
    }

    return json({ error: "not_found", path }, 404);
  },
} satisfies ExportedHandler<Env>;

async function handleWebhook(request: Request, env: Env): Promise<void> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn("webhook: non-JSON body");
    return;
  }

  const inbound = extractInboundMessages(body as Parameters<
    typeof extractInboundMessages
  >[0]);

  if (inbound.length === 0) {
    // statuses / errors / empty — ignored by design
    return;
  }

  for (const message of inbound) {
    try {
      await processInbound(env, message);
    } catch (err) {
      console.error("processInbound failed", message.id, err);
    }
  }
}

async function processInbound(env: Env, message: InboundMessage): Promise<void> {
  if (await isDuplicate(env, message.id)) {
    console.log("dedupe skip", message.id);
    return;
  }

  const rl = await checkRateLimit(env, message.wa_id);
  if (!rl.allowed) {
    console.warn("rate limited", message.wa_id, rl);
    return;
  }

  let session = await getSession(env, message.wa_id);
  if (!session) {
    session = createSession(message.wa_id, message.profile_name);
  } else if (message.profile_name && !session.profile_name) {
    session.profile_name = message.profile_name;
  }

  session.last_message_id = message.id;
  session = advanceStage(session, message.text);
  await saveSession(env, session);

  const payload = buildWakePayload(env, message, session);
  const wake = await wakeCursorAutomation(env, payload);
  if (!wake.ok) {
    console.error("wake failed", wake);
  }
}

/** Optional Messaging API fallback — primary replies use 360dialog MCP send_message. */
async function handleSend(request: Request, env: Env): Promise<Response> {
  const expected = env.SEND_AUTH_TOKEN || env.CURSOR_API_KEY;
  if (!expected) {
    return json(
      {
        error: "send_auth_not_configured",
        hint: "Fallback only. Prefer MCP send_message. Set SEND_AUTH_TOKEN or CURSOR_API_KEY for /send.",
      },
      503,
    );
  }

  const token = extractBearer(request);
  if (!token || !timingSafeEqual(token, expected)) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: { to?: string; text?: string; body?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const to = body.to?.trim();
  const text = (body.text ?? body.body)?.trim();
  if (!to || !text) {
    return json({ error: "to_and_text_required" }, 400);
  }

  const result = await sendTextMessage(env, to, text);
  return json(result, result.ok ? 200 : 502);
}
