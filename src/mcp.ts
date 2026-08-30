/**
 * Minimal Streamable-HTTP-ish MCP server for River Agent WhatsApp send.
 *
 * Official https://mcp.360dialog.com/mcp is Hub-admin only (channels/webhooks/
 * templates) — it does NOT expose customer chat send_message. This Worker MCP
 * wraps the 360dialog Messaging API so Cursor Automations can reply.
 *
 * Auth: Authorization: Bearer <SEND_AUTH_TOKEN or CURSOR_API_KEY>
 * Endpoint: POST /mcp  (also GET /mcp for discovery ping)
 */
import { sendTextMessage } from "./d360";
import type { Env } from "./types";
import { extractBearer, json, timingSafeEqual } from "./util";

const SERVER_INFO = {
  name: "river-agent-whatsapp",
  version: "0.2.0",
};

const TOOLS = [
  {
    name: "send_message",
    description:
      "Send a WhatsApp text reply to a customer via 360dialog Messaging API. Use for every customer-facing River Agent reply. `to` is the wa_id / MSISDN without + (e.g. 27726064522). `text` is the WhatsApp bubble body.",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Customer WhatsApp id / phone digits (wa_id)",
        },
        text: {
          type: "string",
          description: "Message body to send",
        },
      },
      required: ["to", "text"],
    },
  },
  {
    name: "health",
    description: "Check River Agent Worker + Messaging API key presence",
    inputSchema: { type: "object", properties: {} },
  },
];

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
}

function rpcResult(id: JsonRpcId | undefined, result: unknown): Response {
  return json({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(
  id: JsonRpcId | undefined,
  code: number,
  message: string,
): Response {
  return json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  });
}

function authorized(request: Request, env: Env): boolean {
  const expected = env.SEND_AUTH_TOKEN || env.CURSOR_API_KEY;
  if (!expected) return false;
  const token = extractBearer(request);
  return Boolean(token && timingSafeEqual(token, expected));
}

export async function handleMcp(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method === "GET") {
    return json({
      ok: true,
      mcp: SERVER_INFO,
      tools: TOOLS.map((t) => t.name),
      auth: "Authorization: Bearer <SEND_AUTH_TOKEN or CURSOR_API_KEY>",
      note: "Official mcp.360dialog.com is Hub-admin only. Use this River MCP for send_message.",
    });
  }

  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  if (!authorized(request, env)) {
    return json(
      {
        error: "unauthorized",
        hint: "Set SEND_AUTH_TOKEN or CURSOR_API_KEY and send Bearer token",
      },
      401,
    );
  }

  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const method = body.method || "";
  const id = body.id;
  const params = body.params || {};

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
  }

  if (method === "notifications/initialized" || method === "initialized") {
    return new Response(null, { status: 204 });
  }

  if (method === "ping") {
    return rpcResult(id, {});
  }

  if (method === "tools/list") {
    return rpcResult(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const name = String(params.name || "");
    const args = (params.arguments || {}) as Record<string, unknown>;

    if (name === "health") {
      return rpcResult(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              messaging_api_key: Boolean(env.D360_API_KEY),
              dry_run: String(env.DRY_RUN ?? "true"),
            }),
          },
        ],
      });
    }

    if (name === "send_message") {
      const to = String(args.to || "").replace(/\D/g, "");
      const text = String(args.text || "").trim();
      if (!to || !text) {
        return rpcResult(id, {
          isError: true,
          content: [
            { type: "text", text: "to and text are required for send_message" },
          ],
        });
      }
      const result = await sendTextMessage(env, to, text);
      return rpcResult(id, {
        isError: !result.ok,
        content: [{ type: "text", text: JSON.stringify(result) }],
      });
    }

    return rpcResult(id, {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    });
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
}
