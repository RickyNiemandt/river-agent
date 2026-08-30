# GO LIVE — step by step (Ricky)

Repo: https://github.com/RickyNiemandt/river-agent

Do these in order. Prefer **Path A (fastest — no Cloudflare)** for first WhatsApp replies.

---

## Step 0 — GitHub repo

Reusable template: **https://github.com/RickyNiemandt/river-agent**

Clone per customer later — see [CUSTOMERS.md](./CUSTOMERS.md).

---

## Step 1 — Connect 360dialog MCP (do this first)

Official server (streamable HTTP): **`https://mcp.360dialog.com/mcp`**  
Auth: **360dialog Hub** email/password (OAuth). **No separate MCP API keys.**  
Docs: [360dialog MCP](https://docs.360dialog.com/docs/get-started/mcp)

You need the MCP in **two places** for River Agent:

| Where | Why |
| --- | --- |
| **Cursor Desktop** (optional but useful) | Test tools in chat before go-live |
| **Cloud Agents / Automations** | Required — River Agent runs here and must call `send_message` |

---

### 1A — Cursor Desktop (local chat)

1. Open **Cursor Desktop**.
2. Open settings: **Cursor Settings** (gear) → **Tools & MCP**  
   (older builds: **Settings → MCP**, or sidebar **Customize → MCPs**).
3. Click **Add new MCP server** / **New MCP Server**.
4. Choose a **remote / HTTP / URL** server (not a local command).
5. Name it e.g. `360dialog`.
6. URL (exact):

   ```
   https://mcp.360dialog.com/mcp
   ```

   Or put this in `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

   ```json
   {
     "mcpServers": {
       "360dialog": {
         "url": "https://mcp.360dialog.com/mcp"
       }
     }
   }
   ```

7. Save. If Cursor asks you to **Authenticate** / **Connect**, click it.
8. Browser opens 360dialog OAuth:
   - Review scopes → **Approve** (keep messaging / conversation scopes on).
   - Log in with your **360dialog Hub** email/password (Google/Facebook OK if that’s how you use Hub).
   - If asked, pick the correct **organization**.
9. Back in Cursor, the server should show **green / connected**.

**Verify (Desktop):** In Agent chat, ask:

> List my 360dialog conversations (or channels).

You should see tools used such as `list_conversations` / `list_channels`. Expand the tools list and confirm at least:

- `list_conversations`
- `send_message`
- `get_messages`
- `label_conversation`

If auth fails: toggle the server off/on, or remove and re-add, then Authenticate again. Official tip: reconnect if tools do not work.

---

### 1B — Cloud Agents / Automations (required for WhatsApp)

Desktop MCP does **not** automatically enable tools on Automations. Do this too:

1. Open [cursor.com/agents](https://cursor.com/agents) (or Cursor Dashboard → Cloud Agents).
2. Open **MCP** / **Integrations & MCP** (team plans: Dashboard → **Integrations & MCP**).
3. **Add MCP server** → remote URL:

   ```
   https://mcp.360dialog.com/mcp
   ```

4. Complete the same **OAuth** (Hub email/password + scopes + org).
5. Confirm the server is **enabled** for Cloud Agents.

**Verify (Cloud):** Start a one-off Cloud Agent (or wait until Step 2 Automation exists) and ask it to list conversations / channels. Same four chat tools should appear.

---

### Step 1 checklist

- [ ] URL is exactly `https://mcp.360dialog.com/mcp`
- [ ] OAuth done with Hub login (not a made-up API key)
- [ ] Tools visible: `list_conversations`, `send_message`, `get_messages`, `label_conversation`
- [ ] MCP also enabled on the **Cloud / Automation** side (1B)

**Next click after MCP is connected:** go to Step 2 — create the Automation and paste `AUTOMATION_PASTE.md`.

---

## Step 2 — Create Cursor Automation “River Agent” (10 min)

1. Open [cursor.com/automations](https://cursor.com/automations) → **New**
2. Trigger: **Webhook**
3. Repository: **No repository**
4. Tools: enable **360dialog MCP** only (the server from Step 1B)
5. Open [agent/AUTOMATION_PASTE.md](./agent/AUTOMATION_PASTE.md) → copy everything **inside** the fence → paste into the Automation prompt
6. Save → copy **Webhook URL** + **API key**

---

## Path A — Go live without Cloudflare (recommended first)

360dialog Hub can POST straight to the Cursor Automation webhook. **Hub supports custom headers** — use that for the Automation API key (no Cloudflare required).

1. Hub → your WhatsApp channel → **Webhook URL** = Automation webhook URL  
2. Custom headers:
   - Name: `Authorization`
   - Value: `Bearer <AUTOMATION_API_KEY>`
3. Save webhook.
4. WhatsApp your business number with “What packages do you sell?”

**Expect:** River Agent replies via MCP `send_message`, sells from the site, asks need / timeline / fit.

**Note:** Status-only webhooks may still start a run — `AUTOMATION_PASTE.md` tells the agent to no-op those. Worker (Path B) filters them cheaper.

---

## Path B — Cloudflare Worker doorbell (production hardening)

Filters statuses, dedupes, holds session, wakes Automation only on real messages.

```bash
git clone https://github.com/RickyNiemandt/river-agent.git
cd river-agent && npm ci
npx wrangler login
npx wrangler kv namespace create RIVER_KV
npx wrangler kv namespace create RIVER_KV --preview
# paste ids into wrangler.jsonc
npx wrangler secret put CURSOR_WEBHOOK_URL
npx wrangler secret put CURSOR_API_KEY
# set DRY_RUN false in wrangler.jsonc vars when ready
npm run deploy
```

Hub webhook → `https://<worker>/webhook`

Or use GitHub Actions secrets + push to `main` (`.github/workflows/deploy-worker.yml`).

---

## If something breaks

| Symptom | Fix |
| --- | --- |
| No reply | MCP not on Automation; Hub webhook URL/auth wrong |
| Runs but silent | Agent ignored non-message payload — check Hub is sending `messages` |
| Spam / cost | Switch to Path B Worker to drop status ticks |
| Wrong prices | Edit `agent/AUTOMATION_PASTE.md` / `KNOWLEDGE.md` and update Automation |
