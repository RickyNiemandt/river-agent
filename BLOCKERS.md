# Go-live status (evidence-based)

Updated: 2026-08-30 21:31 UTC (Cloud Agent)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Reusable GitHub repo | **Published** | https://github.com/RickyNiemandt/river-agent |
| Messaging API key | **Live** | `.dev.vars` (gitignored). `GET /health` → `messaging_api_configured: true`, `dry_run: false` |
| Live inbound + reply | **Proven** | Three customer texts from `27727710400` (not the WABA line). Local send: `dry_run=false`, `ok=true`, stages timeline → fit → recommend |
| Hub webhook | **Restored to HQ** | Primary set back to production after smoke so inbound survives when this session tunnel dies |

## Proven inbound (this session)

| at (UTC) | from | text | stage | send |
| --- | --- | --- | --- | --- |
| 21:26:42 | 27727710400 | What package do you sell | timeline | ok |
| 21:27:13 | 27727710400 | I want to grow | fit | ok |
| 21:29:57 | 27727710400 | Hello, do you have any whatsapp bots? | recommend | ok |

Smoke send **to the WABA number itself** (`27726064522`) still 400 — Meta will not let a WABA message its own line. Customer send is the real proof.

## Webhooks now

- **Primary:** `https://hq.charmsystemsllc.com/webhook/whatsapp-in`
- **Extra (multi-webhook `river`):** session tunnel (dies when this Cloud Agent stops)

Durable laptop Path Local: [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md) (`C:\Ecolife\RiverBot`).

Rotate the Messaging API key in Hub — it was pasted in chat.
