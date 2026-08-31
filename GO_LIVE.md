# GO LIVE — step by step (Ricky)

Repo: https://github.com/RickyNiemandt/river-agent

**Critical (2026-08-30):** Official [`https://mcp.360dialog.com/mcp`](https://mcp.360dialog.com/mcp) is **Hub-admin only** (channels, webhooks, templates, balance). It does **not** expose customer chat `send_message`. River Agent sends WhatsApp via the **Messaging API** (`D360_API_KEY`) on this Worker — Path Direct — or via **River MCP** `/mcp` when using Cursor Automation.

---

## Step 0 — GitHub repo

Reusable template: **https://github.com/RickyNiemandt/river-agent**  
Windows operator checkout: **`C:\Ecolife\RiverBot`** — [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md)

This Cloud Agent session has a live inbound URL (ephemeral): see [BLOCKERS.md](./BLOCKERS.md).

---

## Path Local (recommended first live reply — `C:\Ecolife\RiverBot`)

No Wrangler login. Node on the laptop + Cloudflare quick-tunnel.

```
WhatsApp → Hub webhook → tunnel → local Node (scripts/local-server.mjs)
                → qualify Need→Timeline→Fit → Messaging API send
```

1. Clone per [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md)  
2. Hub → copy channel **Messaging API key** (`D360-API-KEY`)  
3. In `C:\Ecolife\RiverBot\.dev.vars`: `DRY_RUN=false` + `D360_API_KEY=…`  
4. `npm run local`  
5. Second terminal: `npm run tunnel` → copy `https://….trycloudflare.com`  
6. Hub webhook URL = that host + `/webhook`  
   **or** with key in `.dev.vars`: `npm run go-live` (sets `POST /v1/configs/webhook`)  
7. WhatsApp **Hi** — Need → Timeline → Fit. After a rec, **Hi** or **reset** starts over. This agent sells **Get Found / Get Selling / River Agent** only.

---

## Path Direct (Cloudflare Worker)

```
WhatsApp → 360dialog Hub webhook → Cloudflare Worker
                → qualify Need→Timeline→Fit → Messaging API send
```

### 1) Get channel Messaging API key

1. 360dialog Hub → your WhatsApp channel  
2. Copy the **API key** (Messaging API / channel key — header `D360-API-KEY`)  
3. Keep it for Wrangler secrets

### 2) Deploy Worker

```bash
git clone https://github.com/RickyNiemandt/river-agent.git
cd river-agent && npm ci
npx wrangler login
npx wrangler kv namespace create RIVER_KV
npx wrangler kv namespace create RIVER_KV --preview
# paste ids into wrangler.jsonc
npx wrangler secret put D360_API_KEY
# optional Groq follow-ups after Fit (copy key into the terminal from Drive — do not paste into git):
npx wrangler secret put GROQ_API_KEY
# optional shared bearer for /mcp and /send:
npx wrangler secret put SEND_AUTH_TOKEN
```

In `wrangler.jsonc` vars set:

- `DRY_RUN` = `false`
- `REPLY_MODE` = `worker` (default)

```bash
npm run deploy
```

Note the Worker URL, e.g. `https://river-agent-doorbell.<account>.workers.dev`

### 3) Point Hub webhook at Worker

Hub → channel → Webhook URL = `https://<worker>/webhook`  
(No Bearer required on inbound Hub → Worker for Path Direct.)

### 4) Smoke test

WhatsApp **Hi**. Expect Need → Timeline → Fit, then **one** of Get Found / Get Selling / River Agent (not Custom Automation) with a hot/warm/cold score. After the rec, **Hi** or **reset** starts Need again. Hot leads (≥7) WhatsApp a card to Ricky (`27727710400`).

---

## Optional — Cursor Automation + River MCP (smarter brain)

Use when you want Cursor Automation to craft replies instead of Worker Path Direct.

1. Deploy Worker with `D360_API_KEY` + `SEND_AUTH_TOKEN` (above)  
2. In Cursor Cloud / Automations MCP, add **River MCP**:

   - URL: `https://<worker>/mcp`  
   - Header: `Authorization: Bearer <SEND_AUTH_TOKEN>`  
   - Tools: `send_message`, `health`

3. Create Automation → Webhook → paste [agent/AUTOMATION_PASTE.md](./agent/AUTOMATION_PASTE.md) → enable **River MCP only**  
4. Set Worker `REPLY_MODE` = `automation`, secrets `CURSOR_WEBHOOK_URL` + `CURSOR_API_KEY`  
5. Hub webhook → `https://<worker>/webhook` (Worker filters statuses, wakes Automation)  
6. Automation replies with River MCP `send_message`

**Do not** rely on official `mcp.360dialog.com` for customer replies — Hub-admin only.

Optional: connect official 360dialog MCP separately to *configure* Hub webhooks (`get_webhook` / channel tools) — not for chat.

---

## Official 360dialog MCP (Hub admin — optional)

URL: `https://mcp.360dialog.com/mcp` · Hub OAuth  

Verify with: *List my channels and whether the webhook is configured.*

Typical tools: `get_self`, `list_channels`, `get_webhook`, … — **not** customer `send_message`.

---

## If something breaks

| Symptom | Fix |
| --- | --- |
| No reply | Hub webhook not on Worker; `DRY_RUN` still true; missing `D360_API_KEY` |
| Dry-run only | Set `DRY_RUN=false` and redeploy |
| Automation silent | `REPLY_MODE=automation` but River MCP `/mcp` not connected / wrong Bearer |
| Spam / double replies | Don't use `REPLY_MODE=both` |
| Wrong prices | Edit `src/sales-reply.ts` and/or `agent/AUTOMATION_PASTE.md` |
