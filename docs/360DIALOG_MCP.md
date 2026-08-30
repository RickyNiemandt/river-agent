# Official 360Dialog MCP (Hub admin)

URL: `https://mcp.360dialog.com/mcp`  
Transport: streamable HTTP. OAuth against the 360Dialog Hub.

This MCP manages **Hub infrastructure**. It does **not** send or read customer WhatsApp chat.

Typical tools after login:

1. `get_self` — identity and account context
2. `list_channels` — channels on the org
3. `get_webhook` — live webhook URL for a channel

Also (scope-dependent): channel profile, templates, webhook set/test, balance, invoices, docs search.

Customer replies stay on the **Messaging API** (`D360-API-KEY`) via Path Local / Worker / River MCP `send_message`.

## Cursor Desktop

1. Settings → MCP → add streamable HTTP server  
2. URL: `https://mcp.360dialog.com/mcp`  
3. Restart Cursor if it does not prompt  
4. Authenticate → review redirect → approve scopes  
5. Log into Hub (email/password, Google, or Facebook). Pick the org if asked.

This repo already lists the server in [`.cursor/mcp.json`](../.cursor/mcp.json). Opening the project in Desktop should offer **Authenticate**.

Claude Code: `claude mcp add --transport http 360dialog https://mcp.360dialog.com/mcp` then `/mcp` → Authenticate.  
Codex: `codex mcp add 360dialog --url https://mcp.360dialog.com/mcp` then `codex mcp login 360dialog`.

## Test prompt (after OAuth)

```
List my channels in 360Dialog, and tell me whether the webhook is configured for the first channel.
```

If tools fail, reconnect the MCP.

## Cloud Agents

A Cloud Agent only sees this MCP if it is added on the **Cursor account** MCP list and the run is started **after** you authenticate. This session does not have those tools until then.

Denying `write:channels` hides write tools such as `set_display_name`.
