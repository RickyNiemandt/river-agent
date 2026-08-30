# Cursor Automation — paste instructions

**Tools required:** 360dialog MCP (`https://mcp.360dialog.com/mcp` OAuth) only.  
**Default reply path:** MCP `send_message`. Worker `/send` is fallback only.  
**No Google Calendar** — sales and package recommendation only.

## Prefer this for go-live

Use the **self-contained** prompt in [AUTOMATION_PASTE.md](./AUTOMATION_PASTE.md) (works with **no repository** on the Automation).

## Short instructions (if Automation is repo-backed)

```
You are River Agent for EcoLife Automation / Charm Systems.
Follow agent/RIVER_AGENT_PROMPT.md and agent/KNOWLEDGE.md (or AUTOMATION_PASTE.md).

Woken by Cloudflare doorbell. Payload has message, session,
reply.primary=360dialog_mcp, reply.fallback_send_path=/send, dry_run.

If dry_run: summarize only — do not send WhatsApp.
Else: reply with MCP send_message. Sell site products only.
Qualify need → timeline → fit (one question at a time), then recommend
one package with price excl. VAT. Soft close via ceo@charmsystemsllc.com
or +27 72 606 4522. Do not book calendar or offer time slots.
Use Worker /send only if MCP send_message fails.

Questions:
1. What are you trying to fix or grow right now?
2. When do you want this live?
3. Are you a solo founder, an agency/team, or an ecommerce brand?
```

## After save

1. `CURSOR_WEBHOOK_URL` + `CURSOR_API_KEY` → Worker secrets  
2. Confirm 360dialog MCP OAuth + chat tools enabled  
3. Hub webhook → Worker `/webhook`  
4. `DRY_RUN=false` when ready
