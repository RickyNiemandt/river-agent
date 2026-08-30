# River Agent — setup (Ricky’s clicks)

**Sales-only:** sell charmsystemsllc.com packages on WhatsApp. No Google Calendar booking.

**Send path:** 360dialog **Messaging API** (`D360_API_KEY`).  
Official `https://mcp.360dialog.com/mcp` = Hub admin only — **not** for customer replies.

## Path Direct (recommended first live reply)

1. Hub → copy channel Messaging API key  
2. Deploy Worker — [GO_LIVE.md](./GO_LIVE.md)  
   - `wrangler secret put D360_API_KEY`  
   - `DRY_RUN=false`, `REPLY_MODE=worker`  
3. Hub webhook → `https://<worker>/webhook`  
4. WhatsApp business number → expect Need → Timeline → Fit → package recommend

## Optional — Automation + River MCP

1. `wrangler secret put SEND_AUTH_TOKEN`  
2. Cursor Automations MCP → URL `https://<worker>/mcp` + Bearer token  
3. Paste `agent/AUTOMATION_PASTE.md` · enable River MCP  
4. Worker: `REPLY_MODE=automation` + `CURSOR_WEBHOOK_URL` / `CURSOR_API_KEY`  
5. Hub still points at Worker `/webhook`

```bash
npm install
npx wrangler kv namespace create RIVER_KV
npx wrangler kv namespace create RIVER_KV --preview
# paste ids into wrangler.jsonc
npx wrangler secret put D360_API_KEY
npx wrangler secret put SEND_AUTH_TOKEN
npm run deploy
```
