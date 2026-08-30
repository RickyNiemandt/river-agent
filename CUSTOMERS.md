# Reusing River Agent for customers

This repo is a **template**. For each customer:

## 1. Clone

```bash
git clone https://github.com/RickyNiemandt/river-agent.git customer-acme-river
cd customer-acme-river
```

(Use your real GitHub URL after Step 0 in [GO_LIVE.md](./GO_LIVE.md).)

## 2. Swap brand knowledge

Edit:

- `agent/KNOWLEDGE.md` — products, prices, contacts (from their website)
- `agent/RIVER_AGENT_PROMPT.md` — agent name / brand
- `agent/AUTOMATION_INSTRUCTIONS.md` — paste block for their Automation
- `wrangler.jsonc` — `name` (unique Worker), `BRAND_NAME`, `PUBLIC_SITE`, `SALES_CONTACT_*`

## 3. New Cursor Automation

One Automation **per customer** (or per WhatsApp number), webhook trigger, their knowledge in the prompt, same 360dialog MCP if same Hub — or their Hub OAuth if separate.

## 4. New Worker deploy

```bash
npx wrangler kv namespace create RIVER_KV
# update ids in wrangler.jsonc
npx wrangler secret put CURSOR_WEBHOOK_URL
npx wrangler secret put CURSOR_API_KEY
npm run deploy
```

Point **that customer’s** 360dialog channel webhook → `https://<their-worker>/webhook`.

## 5. Keep EcoLife’s own bot separate

Charm Systems / charmsystemsllc.com = this first deployment.  
Customer bots = clones with different knowledge + Worker name + Automation.

Do not share one Automation across unrelated brands — prompts and memories mix.
