# Handoff

## State
Obsidian Second Brain + RAG system fully deployed. Vault at `/Users/sima/Obsidian/SimVault/` restructured (38 files, 106 chunks indexed). MCP server `obsidian-rag` registered in `~/.claude.json` — needs Claude Code restart to activate. Stop hook wired: `~/.claude/hooks/record-session-stop.sh` → auto-records sessions to `sessions/claude-code/`. Knowledge imports complete: 8 project summaries + 21 Claude memory files. Auto-watcher launchd service running (`com.obsidian-notes-rag.watcher`).

## Next
1. **Restart Claude Code** — activates `obsidian-rag` MCP tools (`mcp__obsidian-rag__*`)
2. **Sim installs Obsidian plugins** — Dataview (for index.md queries) + optionally obsidian-claude-code-mcp
3. Verify MCP search works post-restart: ask Claude to search vault for "ShiftWell sleep algorithm"

## Context
- Vault write access granted via `sudo chmod -R a+w` — no longer needs sudo per-operation
- `obsidian-rag` CLI at `/Users/claud/.local/bin/obsidian-rag`, config uses `nomic-embed-text` via Ollama at `localhost:11434`
- Ollama must be running (`brew services start ollama`) for RAG to work
- Project root ended up at `/Users/claud/Projects/sbos-dashboard` (capital P) — separate from `/Users/claud/projects/sbos-dashboard` (lowercase)
