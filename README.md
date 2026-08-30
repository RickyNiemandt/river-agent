# River Agent

WhatsApp sales AI for [EcoLife Automation / Charm Systems](https://charmsystemsllc.com/).

**Repo:** https://github.com/RickyNiemandt/river-agent

**River Agent** answers public WhatsApp inquiries about the website, stays friendly and sales-focused, qualifies with **Need → Timeline → Fit**, and recommends a site package (prices excl. VAT). Soft close via `ceo@charmsystemsllc.com` or `+27 72 606 4522`. **No calendar booking** in this version.

## Architecture (verified)

Official [`mcp.360dialog.com`](https://mcp.360dialog.com/mcp) is **Hub-admin only** (channels / webhooks / templates). Customer chat send uses the **360dialog Messaging API** (`D360-API-KEY`) via this Worker.

```
WhatsApp → 360dialog Hub → Cloudflare Worker (/webhook)
              ├── Path Direct: qualify + Messaging API send   ← go-live
              └── Optional: wake Cursor Automation
                            └── River MCP /mcp send_message
```

## Fastest go-live (Path Direct)

1. `npm ci` · `wrangler login` · create KV · `wrangler secret put D360_API_KEY`  
2. Set `DRY_RUN=false`, `REPLY_MODE=worker` · `npm run deploy`  
3. Hub webhook → `https://<worker>/webhook`  
4. WhatsApp: “What packages do you sell?”

Full clicks: [GO_LIVE.md](./GO_LIVE.md).

## Optional Cursor Automation

Enable River MCP at `https://<worker>/mcp` (Bearer `SEND_AUTH_TOKEN`), paste [agent/AUTOMATION_PASTE.md](./agent/AUTOMATION_PASTE.md), set `REPLY_MODE=automation`.

```bash
npm install && cp .dev.vars.example .dev.vars && npm run check
npm run dev   # http://127.0.0.1:8787
npm run test:webhook
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness |
| `POST` | `/webhook` | 360dialog inbound |
| `POST` | `/mcp` | River MCP (`send_message`) |
| `POST` | `/send` | Messaging API send (Bearer) |
