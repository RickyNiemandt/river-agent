# Current blockers (evidence-based)

Updated: 2026-08-30 20:15 UTC (Cloud Agent)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Sales-only code | Done | Worker Path Direct + River MCP `/mcp`; typecheck |
| Reusable **GitHub** repo | **Done** | https://github.com/RickyNiemandt/river-agent |
| Official 360dialog MCP chat send | **Not available** | Docs: Hub-admin only (`get_self`, `list_channels`, `get_webhook`, …). No customer `send_message` |
| Path Direct (Messaging API) | **Code ready** | Needs Ricky: `D360_API_KEY` + `wrangler deploy` + Hub → `/webhook` |
| WhatsApp smoke test | **Blocked** | No live Messaging API key / deployed Worker in this session |
| Cursor Automation brain | Optional | River MCP `https://<worker>/mcp` + `REPLY_MODE=automation` |

## What Ricky must do now (Path Direct)

1. Hub → copy channel **Messaging API key** (`D360-API-KEY`)  
2. `npx wrangler login` → `secret put D360_API_KEY` → set `DRY_RUN=false` → `npm run deploy`  
3. Hub webhook URL = `https://<worker>/webhook`  
4. WhatsApp: “What packages do you sell?”

See [GO_LIVE.md](./GO_LIVE.md).
