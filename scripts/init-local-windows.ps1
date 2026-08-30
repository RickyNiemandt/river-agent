# River Agent — create a real git checkout at C:\Ecolife\RiverBot
# Run in PowerShell (as you, not admin required):
#   powershell -ExecutionPolicy Bypass -File scripts\init-local-windows.ps1
#
# Default dest: C:\Ecolife\RiverBot
# Override:     $env:RIVER_DEST = "D:\work\RiverBot"

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/RickyNiemandt/river-agent.git"
$Dest = if ($env:RIVER_DEST) { $env:RIVER_DEST } else { "C:\Ecolife\RiverBot" }

function Need-Git {
  $g = Get-Command git -ErrorAction SilentlyContinue
  if (-not $g) {
    Write-Error "Git is not on PATH. Install https://git-scm.com/download/win then re-run."
  }
}

Need-Git

$parent = Split-Path -Parent $Dest
if (-not (Test-Path $parent)) {
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  Write-Host "Created $parent"
}

if (Test-Path (Join-Path $Dest ".git")) {
  Write-Host "Git already present at $Dest — fetching latest main"
  Set-Location $Dest
  git remote get-url origin 2>$null | Out-Host
  git fetch origin
  git checkout main
  git pull --ff-only origin main
} elseif ((Test-Path $Dest) -and (Get-ChildItem $Dest -Force | Where-Object { $_.Name -ne ".git" })) {
  Write-Host "Folder exists but is not a git repo. Initializing and pulling GitHub main."
  Set-Location $Dest
  git init -b main
  git remote remove origin 2>$null
  git remote add origin $RepoUrl
  git fetch origin
  git checkout -B main origin/main
} else {
  if (Test-Path $Dest) { Remove-Item $Dest -Force -Recurse -ErrorAction SilentlyContinue }
  Write-Host "Cloning $RepoUrl -> $Dest"
  git clone --branch main $RepoUrl $Dest
  Set-Location $Dest
}

Write-Host ""
Write-Host "Local git ready:"
Write-Host "  path:   $Dest"
Write-Host "  remote: $(git -C $Dest remote get-url origin)"
Write-Host "  head:   $(git -C $Dest rev-parse --short HEAD) $(git -C $Dest log -1 --pretty=%s)"
Write-Host ""
Write-Host "Next:"
Write-Host "  cd $Dest"
Write-Host "  copy .dev.vars.example .dev.vars"
Write-Host "  npm ci"
Write-Host "  npm run check"
Write-Host "  See GO_LIVE.md"
