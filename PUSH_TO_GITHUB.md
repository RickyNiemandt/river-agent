# Push this scaffold to GitHub (Ricky)

Target (already created, currently empty): https://github.com/RickyNiemandt/river-agent

Cloud Agent GitHub MCP can **read** the repo but gets **403** on write. Until a write-capable `GITHUB_TOKEN` / App permission is available, push from your laptop:

## Option 1 — clone empty + copy from this workspace

If you have this Cloud Agent folder or the artifact `river-agent-main.tar.gz`:

```bash
git clone https://github.com/RickyNiemandt/river-agent.git
cd river-agent
tar -xzf /path/to/river-agent-main.tar.gz
# or: copy files from the Cloud Agent /workspace (exclude node_modules, .git, .dev.vars, .wrangler)
git add -A
git status   # should show Worker src/, agent/AUTOMATION_PASTE.md, GO_LIVE.md, etc.
git commit -m "Initial River Agent sales-only scaffold"
git push -u origin main
```

## Option 2 — git bundle

```bash
git clone river-agent.bundle river-agent-tmp
cd river-agent-tmp
git remote add github https://github.com/RickyNiemandt/river-agent.git
git push -u github main
```

## Verify

```bash
curl -sL https://raw.githubusercontent.com/RickyNiemandt/river-agent/main/GO_LIVE.md | head -5
curl -sL https://api.github.com/repos/RickyNiemandt/river-agent/contents/agent/AUTOMATION_PASTE.md | head -c 200
curl -sL https://api.github.com/repos/RickyNiemandt/river-agent/contents/src/index.ts | head -c 200
```

Then continue Path A in [GO_LIVE.md](./GO_LIVE.md).
