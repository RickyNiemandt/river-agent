# Go-live status (evidence-based)

Updated: 2026-08-31 05:15 UTC (Cloud Agent)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Reusable GitHub repo | **Published** | https://github.com/RickyNiemandt/river-agent |
| Messaging API key | **Live** | `.dev.vars` (gitignored). `GET /health` → `messaging_api_configured: true`, `dry_run: false` |
| Live inbound + reply | **Proven 2026-08-30** | Customer `27727710400` — four texts, send `ok` (last at 21:39 UTC: Custom Automation) |
| Overnight gap | **Tunnel died** | `ridge-ensemble-seminar-hurricane.trycloudflare.com` stopped resolving. Hub still pointed there. New messages never reached River. |
| Hub webhook | **Repointed 05:14 UTC** | Primary → `https://show-equal-gibson-nyc.trycloudflare.com/webhook` |

## Webhooks now

- **Primary:** `https://show-equal-gibson-nyc.trycloudflare.com/webhook`
- **Extra `hq`:** `https://hq.charmsystemsllc.com/webhook/whatsapp-in`

Quick tunnels die when this Cloud Agent sleeps. Durable path: Path Local on `C:\Ecolife\RiverBot` ([LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md)) or a named Cloudflare tunnel / Worker.

Rotate the Messaging API key in Hub — it was pasted in chat.
