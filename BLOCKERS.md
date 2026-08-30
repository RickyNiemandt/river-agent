# Current blockers (evidence-based)

Updated: 2026-08-30 17:49 UTC (Cloud Agent retry)

| Goal piece | Status | Evidence |
| --- | --- | --- |
| Sales-only code | Done | On Origin `main` (`21903c4`); typecheck green; prompts sales-only |
| Self-contained Automation paste | Done | `agent/AUTOMATION_PASTE.md` (ignores status-only) |
| Path A docs (Hub → Automation, no CF) | Done | `GO_LIVE.md` (Desktop + Cloud MCP click path) |
| Reusable **GitHub** repo URL | Exists, **empty** | https://github.com/RickyNiemandt/river-agent — API `size: 0`, contents 404 “repository is empty” |
| Push scaffold to GitHub | **Blocked** | `GITHUB_TOKEN` / `GH_TOKEN` **unset** in env; `git push github` fails (no credentials); GitHub MCP `push_files` → **403** `Resource not accessible by personal access token` (2026-08-30 17:49 UTC retry) |
| 360dialog MCP in this session | **Absent** | No 360dialog / WhatsApp / `send_message` tools in dynamic MCP catalog |
| WhatsApp go-live | **Needs Ricky** | Path A: MCP OAuth + Automation + Hub webhook + Bearer header |
| Cloudflare Worker | Optional | Path B hardening |

## What Ricky must do now

### A) Publish the reusable repo (one of — then reply **retry push**)

1. Add Cloud Agent secret **`GITHUB_TOKEN`** (classic PAT `repo`, or fine-grained **Contents: Write** on `RickyNiemandt/river-agent`), **or**
2. Grant Cursor GitHub App **Contents: Read and write** on that repo, **or**
3. Manual push from a machine logged into GitHub — see [PUSH_TO_GITHUB.md](./PUSH_TO_GITHUB.md) / artifact `river-agent-reusable.tar.gz`

### B) Path A WhatsApp go-live clicks (after repo has code, or using paste from this workspace)

1. Connect MCP per [GO_LIVE.md](./GO_LIVE.md) Step 1 (Desktop **and** Cloud Agents) — URL `https://mcp.360dialog.com/mcp`, Hub OAuth  
2. [cursor.com/automations](https://cursor.com/automations) → Webhook → paste `agent/AUTOMATION_PASTE.md` → enable 360dialog MCP → copy URL + API key  
3. 360dialog Hub webhook URL = Automation URL; custom header `Authorization: Bearer <key>`  
4. WhatsApp smoke test: “What packages do you sell?”

See [GO_LIVE.md](./GO_LIVE.md).
