# River Agent — setup (Ricky’s clicks)

**Sales-only:** sell charmsystemsllc.com packages on WhatsApp. No Google Calendar booking in this version.

**Primary:** 360dialog MCP OAuth sends/reads WhatsApp (`send_message`, etc.).

## Path A (recommended for first live reply — no Cloudflare)

1. Connect 360dialog MCP (Desktop **and** Cloud Agents) — full clicks in [GO_LIVE.md](./GO_LIVE.md) Step 1  
   URL: `https://mcp.360dialog.com/mcp` → OAuth with Hub email/password → confirm `send_message` etc.
2. [cursor.com/automations](https://cursor.com/automations) → **New** → Webhook → paste `agent/AUTOMATION_PASTE.md` → enable **360dialog MCP only**
3. Copy Automation webhook URL + API key
4. 360dialog Hub → channel webhook:
   - URL = Automation webhook URL
   - Custom header: `Authorization` = `Bearer <API key>` (Hub supports custom headers)
5. WhatsApp the business number → expect MCP `send_message` reply

Status-only Hub events: Automation ignores them (see paste prompt).

## Path B (optional Worker doorbell)

Worker: inbound Hub webhook → wake Cursor only.  
Messaging API `/send`: optional fallback — not required.

1. After Automation exists, set Worker secrets `CURSOR_WEBHOOK_URL`, `CURSOR_API_KEY`
2. Deploy Worker; Hub webhook → `https://<worker>/webhook` (do not dual-webhook with Path A)
3. `DRY_RUN=false` → smoke test

```bash
npm install
npx wrangler kv namespace create RIVER_KV
npx wrangler kv namespace create RIVER_KV --preview
# paste ids into wrangler.jsonc
npx wrangler secret put CURSOR_WEBHOOK_URL
npx wrangler secret put CURSOR_API_KEY
npm run deploy
```

Full ordered checklist: [GO_LIVE.md](./GO_LIVE.md).
