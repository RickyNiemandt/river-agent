# River Agent

WhatsApp sales AI for [EcoLife Automation / Charm Systems](https://charmsystemsllc.com/).

**Repo:** https://github.com/RickyNiemandt/river-agent  
**Operator checkout (Windows):** `C:\\Ecolife\\RiverBot` — [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md)

**River Agent** answers public WhatsApp inquiries about the website, stays friendly and sales-focused, qualifies with **Need → Timeline → Fit**, and recommends **one** of three site packages: **Get Found**, **Get Selling**, or **River Agent** (prices excl. VAT). Say **Hi** or **reset** after a recommendation to start again. Soft close via `ceo@charmsystemsllc.com` or `+27 72 606 4522`. **No calendar booking** in this version.

After Fit the bot scores 0–10 (hot / warm / cold). Hot leads (≥7) WhatsApp a card to Ricky (`27727710400`). Follow-ups after the recommendation use Groq when `GROQ_API_KEY` is set.

## Architecture (verified)

Official [`mcp.360dialog.com`](https://mcp.360dialog.com/mcp) is **Hub-admin only** (channels / webhooks / templates). Connect it in Cursor Desktop — [docs/360DIALOG_MCP.md](./docs/360DIALOG_MCP.md). Customer chat send uses the **360dialog Messaging API** (`D360-API-KEY`) via Path Local or this Worker.

```
WhatsApp → 360dialog Hub → Cloudflare Worker (/webhook)
              ├── Path Direct: qualify + Messaging API send   ← go-live
              └── Optional: wake Cursor Automation
                            └── River MCP /mcp send_message
```

## Fastest go-live (Path Local — `C:\\Ecolife\\RiverBot`)

```powershell
git clone https://github.com/RickyNiemandt/river-agent.git C:\\Ecolife\\RiverBot
cd C:\\Ecolife\\RiverBot
copy .dev.vars.example .dev.vars
# set DRY_RUN=false and D360_API_KEY in .dev.vars
npm run local
# second terminal: npm run tunnel → Hub webhook = https://….trycloudflare.com/webhook
```

See [LOCAL_WINDOWS.md](./LOCAL_WINDOWS.md).

## Cloudflare Worker (Path Direct)

1. `npm ci` · `wrangler login` · create KV · `wrangler secret put D360_API_KEY`  
2. Optional Groq follow-ups: `wrangler secret put GROQ_API_KEY` (copy from Drive into the terminal — do not paste into git/chat)  
3. Set `DRY_RUN=false`, `REPLY_MODE=worker` · `npm run deploy`  
4. Hub webhook → `https://<worker>/webhook`  
5. WhatsApp **Hi** — then Need → Timeline → Fit. After a rec, **Hi** starts over.

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
