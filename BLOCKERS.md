# Current blockers (evidence-based)

Updated: 2026-08-30 21:00 UTC (Cloud Agent)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Reusable GitHub repo | **Published** | https://github.com/RickyNiemandt/river-agent — Path Local + Worker + sales funnel |
| Sales funnel (dry-run) | **Done** | Public tunnel Need→Timeline→Fit→one package (see inbox) |
| Public inbound webhook | **Up this session** | `https://ridge-ensemble-seminar-hurricane.trycloudflare.com/webhook` → 200 |
| Official 360Dialog MCP | **Hub-admin only** | `get_self` / `list_channels` / `get_webhook` — **no** customer `send_message`. Not attached to this Cloud Agent. Connect in Cursor Desktop — [docs/360DIALOG_MCP.md](./docs/360DIALOG_MCP.md) |
| Messaging API key | **Blocked** | `.dev.vars` `D360_API_KEY` empty — cannot set Hub webhook via API or send WhatsApp |
| Live WhatsApp smoke | **Blocked** | Needs key + Hub pointed at webhook |

## Do this now

1. **Cursor Desktop:** add `https://mcp.360dialog.com/mcp`, authenticate Hub, then ask: *List my channels and whether the webhook is configured.*
2. **360dialog Hub** (or official MCP webhook tools) → channel webhook URL =

   `https://ridge-ensemble-seminar-hurricane.trycloudflare.com/webhook`

   Session tunnel — dies when this Cloud Agent stops. Durable laptop path: [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md).

3. Put the channel **Messaging API key** (`D360-API-KEY`) in `.dev.vars` and run `npm run go-live`, **or** paste the key in this chat.

4. WhatsApp [wa.me/27726064522](https://wa.me/27726064522): `What packages do you sell?`

Watch inbound (even before the send key):  
https://ridge-ensemble-seminar-hurricane.trycloudflare.com/inbox

Until the key is in, replies stay dry-run (logged, not sent).
