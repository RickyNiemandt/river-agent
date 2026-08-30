---
name: River Agent sales-only
overview: "River Agent sales-only WhatsApp: Path Local or Worker Path Direct via 360dialog Messaging API. Official mcp.360dialog.com is Hub-admin only. Qualify need/timeline/fit and sell site packages — no calendar booking."
todos:
  - id: clarify-scope
    content: Scope locked — sales-only, no calendar
    status: completed
  - id: scrape-site-knowledge
    content: Freeze website knowledge pack from charmsystemsllc.com into prompt/assets
    status: completed
  - id: path-local
    content: Path Local Node webhook + tunnel (scripts/local-server.mjs)
    status: completed
  - id: path-direct
    content: Worker Path Direct + River MCP send_message
    status: completed
  - id: github-repo
    content: Publish reusable GitHub repo RickyNiemandt/river-agent
    status: completed
  - id: attach-360-hub-mcp
    content: Official mcp.360dialog.com OAuth in Cursor Desktop — Hub admin only (channels/webhook), not chat send
    status: pending
  - id: secrets-messaging
    content: Channel D360_API_KEY required for webhook set + WhatsApp send
    status: pending
  - id: point-360-webhook
    content: Point 360dialog channel webhook at live /webhook URL
    status: pending
  - id: smoke-test
    content: E2E WhatsApp trial through qualify + package recommendation
    status: pending
isProject: false
---

# River Agent — sales-only plan

**Send path:** 360dialog Messaging API (`D360-API-KEY` → `POST …/messages`) via Path Local or Worker Path Direct. River MCP `/mcp` wraps that send for Cursor Automation.

**Official** [`https://mcp.360dialog.com/mcp`](https://mcp.360dialog.com/mcp) is **Hub-admin only** (`get_self`, `list_channels`, `get_webhook`, templates, balance). It does **not** expose customer `send_message`. Connect it in Cursor Desktop to inspect/set Hub webhook — not to reply to WhatsApp.

**No Google Calendar** — recommend one site package and soft-close via ceo@ / phone.

Site knowledge: charmsystemsllc.com → `agent/KNOWLEDGE*.md`.
