# Current blockers (evidence-based)

Updated: 2026-08-30 20:00 UTC (Cloud Agent — GitHub publish complete)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Sales-only code | Done | On Origin `main`; typecheck green; prompts sales-only |
| Self-contained Automation paste | Done | `agent/AUTOMATION_PASTE.md` (ignores status-only) |
| Path A docs (Hub → Automation, no CF) | Done | `GO_LIVE.md` (Desktop + Cloud MCP click path) |
| Reusable **GitHub** repo URL | **Done** | https://github.com/RickyNiemandt/river-agent |
| Push scaffold to GitHub | **Done** | GitHub MCP `push_files` batches published to `main` (docs, agent pack, package-lock, Worker `src/`); verified `README.md`, `GO_LIVE.md`, `agent/AUTOMATION_PASTE.md`, `src/index.ts` |
| 360dialog MCP in this session | **Absent** | No 360dialog / WhatsApp / `send_message` tools in dynamic MCP catalog |
| WhatsApp go-live | **Needs Ricky** | Path A: MCP OAuth + Automation + Hub webhook + Bearer header |
| Cloudflare Worker | Optional | Path B hardening |

## What Ricky must do now

### Path A WhatsApp go-live clicks

1. Connect MCP per [GO_LIVE.md](./GO_LIVE.md) Step 1 (Desktop **and** Cloud Agents) — URL `https://mcp.360dialog.com/mcp`, Hub OAuth  
2. [cursor.com/automations](https://cursor.com/automations) → Webhook → paste `agent/AUTOMATION_PASTE.md` → enable 360dialog MCP → copy URL + API key  
3. 360dialog Hub webhook URL = Automation URL; custom header `Authorization: Bearer <key>`  
4. WhatsApp smoke test: “What packages do you sell?”

See [GO_LIVE.md](./GO_LIVE.md).
