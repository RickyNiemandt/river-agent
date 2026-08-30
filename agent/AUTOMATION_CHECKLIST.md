# Automation setup checklist

**Primary:** 360dialog MCP OAuth chat tools. **Worker:** doorbell only. **`/send`:** optional fallback.  
**No Calendar MCP** for this sales-only slice.

- [ ] Webhook Automation; secrets `CURSOR_WEBHOOK_URL` / `CURSOR_API_KEY`
- [ ] MCP `https://mcp.360dialog.com/mcp` OAuth — `list_conversations`, `send_message`, `get_messages`, `label_conversation`
- [ ] Prompt from AUTOMATION_PASTE.md (self-contained) or AUTOMATION_INSTRUCTIONS.md + KNOWLEDGE*.md
- [ ] Hub webhook → Worker `/webhook`
- [ ] Smoke: inbound → Automation → MCP reply → package recommendation (no booking)
