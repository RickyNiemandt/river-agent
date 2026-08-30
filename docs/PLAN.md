---
name: WhatsApp MCP agents
overview: "River Agent sales-only: Cursor Automation + Cloudflare doorbell Worker. Primary WhatsApp via 360dialog Hub MCP (OAuth). Qualify need/timeline/fit and sell site packages — no calendar booking."
todos:
  - id: clarify-scope
    content: Scope locked — sales-only, no calendar
    status: completed
  - id: scrape-site-knowledge
    content: Freeze website knowledge pack from charmsystemsllc.com into prompt/assets
    status: completed
  - id: build-relay
    content: Scaffold CF Worker (webhook ack, filter, session, wake Cursor; optional Messaging API fallback)
    status: completed
  - id: create-webhook-automation
    content: River Agent Automation prompt + setup checklist (360dialog MCP OAuth, sales-only)
    status: completed
  - id: attach-360-hub-mcp
    content: User adds https://mcp.360dialog.com/mcp via OAuth — primary send/read tools
    status: pending
  - id: secrets-messaging
    content: Optional — channel API key on Worker only if Messaging API fallback is needed
    status: pending
  - id: point-360-webhook
    content: Point 360dialog channel webhook at deployed Worker URL
    status: pending
  - id: smoke-test
    content: E2E WhatsApp trial through qualify + package recommendation
    status: pending
isProject: false
---
# River Agent — sales-only plan

Primary: Automation + `https://mcp.360dialog.com/mcp` OAuth → `send_message` / `get_messages` / `list_conversations` / `label_conversation`.  
Worker: inbound webhook doorbell only.  
Messaging API: optional `/send` fallback.  
**No Google Calendar** — recommend packages and soft-close via ceo@ / phone.  
Site knowledge: charmsystemsllc.com → agent/KNOWLEDGE*.md.
