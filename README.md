# River Agent

WhatsApp sales AI for [EcoLife Automation / Charm Systems](https://charmsystemsllc.com/).

**Repo:** https://github.com/RickyNiemandt/river-agent

**River Agent** answers public WhatsApp inquiries about the website, stays friendly and sales-focused, qualifies with **Need → Timeline → Fit**, and recommends a site package (prices excl. VAT). Soft close via `ceo@charmsystemsllc.com` or `+27 72 606 4522`. **No calendar booking** in this version.

## Fastest go-live (Path A — no Cloudflare)

```
WhatsApp → 360dialog Hub webhook → Cursor Automation (+ Authorization Bearer)
                → 360dialog MCP send_message → WhatsApp
```

1. Connect MCP `https://mcp.360dialog.com/mcp` (Hub OAuth)
2. Create Cursor Automation; paste [agent/AUTOMATION_PASTE.md](./agent/AUTOMATION_PASTE.md); enable 360dialog MCP
3. Hub webhook URL = Automation webhook URL; custom header `Authorization: Bearer <API key>` (Hub supports custom headers)

See [GO_LIVE.md](./GO_LIVE.md).

## Optional Path B — Worker doorbell

```
WhatsApp → 360dialog → Cloudflare Worker → wake Cursor Automation
                        └── 360dialog MCP OAuth → send_message → WhatsApp
```

| Piece | Role |
| --- | --- |
| **360dialog MCP** `https://mcp.360dialog.com/mcp` | **Primary** chat after Hub OAuth |
| **Cursor Automation** | Conversation brain — sell site products only |
| **Cloudflare Worker** | Optional inbound filter/dedupe → wake Automation |
| **Messaging API** | Optional Worker `/send` fallback |

See [SETUP.md](./SETUP.md), [CUSTOMERS.md](./CUSTOMERS.md), [BLOCKERS.md](./BLOCKERS.md).

```bash
npm install && cp .dev.vars.example .dev.vars && npm run check
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness |
| `POST` | `/webhook` | 360dialog inbound doorbell (Path B) |
| `POST` | `/send` | Optional Messaging API fallback |

Deploy Worker: set `CURSOR_WEBHOOK_URL` + `CURSOR_API_KEY`, then `npm run deploy`.
