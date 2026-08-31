# Local git — `C:\Ecolife\RiverBot`

## ASAP — this PC is the 24/7 bot

Sleep off. Then in PowerShell:

```powershell
cd C:\Ecolife\RiverBot
git pull origin main
```

Confirm `.dev.vars` has `DRY_RUN=false` and `D360_API_KEY`. Double-click **`start-river-pc.cmd`**.

Leave both windows open. Check `http://127.0.0.1:8791/health` then WhatsApp https://wa.me/27726064522 from a **different** phone.

---

This Cloud Agent cannot write to your Windows `C:` drive. Run one of the blocks below **on your laptop** to create a real git checkout at `C:\Ecolife\RiverBot`.

Remote: https://github.com/RickyNiemandt/river-agent

---

## Fastest — paste in PowerShell

```powershell
New-Item -ItemType Directory -Force -Path C:\Ecolife | Out-Null
git clone https://github.com/RickyNiemandt/river-agent.git C:\Ecolife\RiverBot
cd C:\Ecolife\RiverBot
git status
copy .dev.vars.example .dev.vars
```

If the folder already exists and is empty:

```powershell
cd C:\Ecolife\RiverBot
git init -b main
git remote add origin https://github.com/RickyNiemandt/river-agent.git
git fetch origin
git checkout -B main origin/main
```

If the folder already has a `.git`:

```powershell
cd C:\Ecolife\RiverBot
git remote set-url origin https://github.com/RickyNiemandt/river-agent.git
git fetch origin
git checkout main
git pull --ff-only origin main
```

---

## Script (same result)

From a copy of this repo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\init-local-windows.ps1
```

Or double-click `scripts\init-local-windows.cmd`.

Override dest: `$env:RIVER_DEST = "D:\work\RiverBot"` then run the script.

---

## After clone — local go-live (no Cloudflare login)

```powershell
cd C:\Ecolife\RiverBot
copy .dev.vars.example .dev.vars
notepad .dev.vars
```

In `.dev.vars` set:

```
DRY_RUN=false
D360_API_KEY=<Hub channel Messaging API key>
```

Terminal 1:

```powershell
npm run local
```

Terminal 2 (public HTTPS for Hub):

```powershell
npm run tunnel
```

Copy the `https://….trycloudflare.com` URL. Hub webhook = `https://….trycloudflare.com/webhook`

WhatsApp the business number: `What packages do you sell?`

To point Hub via API (needs `D360_API_KEY` in `.dev.vars`):

```powershell
$env:WEBHOOK_URL = "https://YOUR-TUNNEL.trycloudflare.com/webhook"
npm run go-live
```

Or double-click `scripts\start-local.cmd` for terminal 1.

Keep the quick-tunnel up while this machine is on (restarts cloudflared + Hub if the hostname dies):

```powershell
npm run watch-tunnel
```

Worker deploy (optional): [GO_LIVE.md](./GO_LIVE.md).
