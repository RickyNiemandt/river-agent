# Automation checklist (optional Path)

- [ ] Worker deployed with `D360_API_KEY` + `SEND_AUTH_TOKEN`
- [ ] River MCP connected: `https://<worker>/mcp` + Bearer — tools `send_message`, `health`
- [ ] Automation prompt pasted from `AUTOMATION_PASTE.md`
- [ ] `REPLY_MODE=automation` + Cursor webhook secrets on Worker
- [ ] Hub webhook → Worker `/webhook`
- [ ] Smoke: “What packages do you sell?”

Note: Official `mcp.360dialog.com` is Hub-admin only — not for chat send.
