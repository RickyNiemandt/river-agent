# Architecture

| Piece | Role |
| --- | --- |
| **360dialog Messaging API** | **Primary** customer WhatsApp send (`D360-API-KEY` → `POST …/messages`) |
| **Cloudflare Worker** | Webhook ack, dedupe, session, Path Direct sales replies, River MCP `/mcp`, `/send` |
| **River MCP** `https://<worker>/mcp` | Exposes `send_message` for Cursor Automations (Bearer auth) |
| **Official 360dialog MCP** `https://mcp.360dialog.com/mcp` | **Hub admin only** — channels, webhooks, templates, balance. **No chat send.** |
| **Cursor Automation** | Optional conversation brain when `REPLY_MODE=automation` |

## Flows

```
Path Direct (go-live):
  WhatsApp → Hub → Worker /webhook → sales-reply → Messaging API → WhatsApp

Path Automation:
  WhatsApp → Hub → Worker /webhook → wake Cursor Automation
                 → River MCP send_message → Messaging API → WhatsApp
```

`REPLY_MODE`: `worker` (default) | `automation` | `both` (debug only — risk of double reply).
