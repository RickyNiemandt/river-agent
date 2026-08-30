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

## Script (same result)

From a copy of this repo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\init-local-windows.ps1
```

Or double-click `scripts\init-local-windows.cmd`.

Override dest: `$env:RIVER_DEST = "D:\work\RiverBot"` then run the script.

---

## After clone

```powershell
cd C:\Ecolife\RiverBot
npm ci
npm run check
```

Go-live (Messaging API): [GO_LIVE.md](./GO_LIVE.md).
