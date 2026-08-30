# Current blockers (evidence-based)

Updated: 2026-08-30 21:20 UTC (Cloud Agent)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Reusable GitHub repo | **Published** | https://github.com/RickyNiemandt/river-agent |
| Messaging API key | **Loaded this session** | `.dev.vars` (gitignored). `GET /health` → `messaging_api_configured: true`, `dry_run: false` |
| Hub webhook | **Set** | `GET /v1/configs/webhook` → `https://ridge-ensemble-seminar-hurricane.trycloudflare.com/webhook` |
| Smoke send to WABA number | **400 expected** | Meta rejects sending to the same WhatsApp number (`27726064522`) |
| Live inbound + reply | **Waiting** | WhatsApp [wa.me/27726064522](https://wa.me/27726064522) from a **different** phone |

## Do this now

From any phone that is **not** the business line, WhatsApp:

https://wa.me/27726064522

Send: `What packages do you sell?`

Watch: https://ridge-ensemble-seminar-hurricane.trycloudflare.com/inbox

Session tunnel dies when this Cloud Agent stops. Durable laptop path: [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md).
