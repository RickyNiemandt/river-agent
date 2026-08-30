# Current blockers (evidence-based)

Updated: 2026-08-30 20:42 UTC (Cloud Agent)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Reusable GitHub repo | **Done** | https://github.com/RickyNiemandt/river-agent — `scripts/local-server.mjs`, `src/index.ts`, `LOCAL_WINDOWS.md` all 200 |
| Sales funnel (dry-run) | **Done** | Local + public tunnel: Need→Timeline→Fit→package; status-only no-op |
| Public inbound webhook | **Up this session** | `https://ridge-ensemble-seminar-hurricane.trycloudflare.com/webhook` → 200 + sales reply log |
| Official 360dialog MCP chat send | **Not available** | Hub-admin only |
| Messaging API key | **Blocked** | `.dev.vars` `D360_API_KEY` empty — cannot send WhatsApp |
| Live WhatsApp smoke | **Blocked** | Needs key + Hub pointed at webhook |

## Do this now (2 clicks)

1. **360dialog Hub** → channel → Webhook URL =

   `https://ridge-ensemble-seminar-hurricane.trycloudflare.com/webhook`

   (session tunnel — dies when this Cloud Agent stops. For a durable laptop path use [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md).)

2. Paste the channel **Messaging API key** (`D360-API-KEY`) here or into `C:\Ecolife\RiverBot\.dev.vars` with `DRY_RUN=false`.

3. WhatsApp the business number: `What packages do you sell?`

Until the key is in, replies stay dry-run (logged, not sent).
