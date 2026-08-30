# River Agent — canonical architecture

**Sales-only.** Customer chat is 360dialog MCP (OAuth). No Google Calendar in this slice.

| Layer | Responsibility |
| --- | --- |
| **360dialog MCP** `https://mcp.360dialog.com/mcp` | **Primary** WhatsApp send/read after Hub OAuth. Tools: `list_conversations`, `send_message`, `get_messages`, `label_conversation`. No separate MCP API keys. |
| **Cursor Automation** | Brain (prompt + knowledge); sells site packages; calls MCP chat tools |
| **Cloudflare Worker** | Optional inbound 360dialog webhook → 200 ASAP; dedupe; qualify session; rate-limit; **wake Cursor only** |
| **Messaging API** (`D360-API-KEY`) | **Optional** Worker `POST /send` fallback if MCP send unavailable |

Outbound path (primary):

```
Automation → 360dialog MCP send_message (Hub OAuth) → WhatsApp
```

Inbound paths:

```
Path A (recommended go-live): WhatsApp → 360dialog Hub → Cursor Automation webhook (Bearer) → MCP send_message
Path B (optional):             WhatsApp → 360dialog → Worker doorbell → Cursor Automation wake → MCP send_message
```

Defaults: Need → Timeline → Fit → package recommend + soft close. Path A needs MCP + Automation + Hub webhook only.

See [SETUP.md](./SETUP.md), [README.md](./README.md), [docs/PLAN.md](./docs/PLAN.md).
