# Local git — `C:\Ecolife\RiverBot`

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

Or double-click `scripts\start-local.cmd` for terminal 1.
