# Guarding destructive tools with Claude Code hooks

This server exposes destructive Management API tools (`delete-*`, `unpublish-content-item-variant`, `publish-content-item-variant`, `update-*`, `patch-*`, `create-*`, `change-content-item-variant-workflow-step`). Because a connected agent can be steered by [indirect prompt injection](../README.md#-security) in CMS content, it is worth adding a **deterministic, client-side gate** that asks you to confirm before any such tool runs — regardless of what the model decided.

[Claude Code hooks](https://code.claude.com/docs/en/hooks) are the right mechanism for this. A `PreToolUse` hook fires **before** a tool executes and can force the permission prompt (or deny outright). It is a local control: **you** configure it, and a model that has been hijacked cannot turn it off.

> Hooks are a Claude Code feature configured on your machine. An MCP server cannot ship or enforce them — this directory only provides a copy-paste example. Other clients (Claude Desktop, VS Code Copilot, …) have their own approval UX driven by the `destructiveHint` annotations this server already sets.

## What's here

- [`../examples/claude-code-hooks/settings.json`](../examples/claude-code-hooks/settings.json) — hook registration
- [`../examples/claude-code-hooks/confirm-destructive.mjs`](../examples/claude-code-hooks/confirm-destructive.mjs) — the guard script (Node, cross-platform; no `jq`/bash needed)

## Setup

1. Copy the two example files into the project where you use this server:
   - `examples/claude-code-hooks/settings.json` → merge its `hooks` block into your `.claude/settings.json`
   - `examples/claude-code-hooks/confirm-destructive.mjs` → `.claude/hooks/confirm-destructive.mjs`
2. **Adjust the server name in the matcher.** The matcher prefix must match the name you registered the server under (`claude mcp add <name> …`). The example assumes `kontent-ai`, so tools are `mcp__kontent-ai__delete-content-item` etc. If you registered it as `kontent-ai-multi`, change the matcher to `mcp__kontent-ai-multi__...`.
3. Restart your Claude Code session.

Now any destructive Kontent.ai tool call pauses for your approval, showing which tool and arguments are about to run.

### `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__kontent-ai__(create|update|patch|delete|publish|unpublish|change)-.*",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/confirm-destructive.mjs\""
          }
        ]
      }
    ]
  }
}
```

The `matcher` is a JavaScript regex (anything beyond letters/digits/`_`/`|` is treated as a regex), so `(create|update|patch|delete|publish|unpublish|change)-.*` selects exactly the mutating tools and leaves read tools (`get-*`, `list-*`, `search-*`) to auto-approve.

### `.claude/hooks/confirm-destructive.mjs`

The script reads the hook payload from stdin (`tool_name`, `tool_input`) and emits a `permissionDecision: "ask"`, which surfaces the confirmation dialog. See the file in [`examples/claude-code-hooks/`](../examples/claude-code-hooks/confirm-destructive.mjs).

## Variations

- **Block outright instead of prompting.** Change `permissionDecision` to `"deny"` in the script. The reason is fed back to the model, and the call never runs. Useful for a read-only session where deletes should never happen.
- **No script at all (simpler, coarser).** Claude Code [permission rules](https://code.claude.com/docs/en/permissions) can force a prompt without a hook, but their MCP wildcards only support the whole-server form `mcp__kontent-ai__*` or exact tool names — they cannot match `delete-*`. So either gate the whole server (prompts on reads too):
  ```json
  { "permissions": { "ask": ["mcp__kontent-ai__*"] } }
  ```
  or list each destructive tool explicitly in the `ask` array. The hook above is preferred because its regex matcher gates **only** destructive tools.
- **Audit returned content (detection, not prevention).** A `PostToolUse` hook on the read tools receives the tool's response and can log or flag suspicious content — but it fires *after* execution, so it cannot block. Pair it with the `PreToolUse` gate above for prevention.

## Why this is worth doing

Server-side text marking of "untrusted" content does not stop a determined attacker ([adaptive attacks break delimiter defenses](https://arxiv.org/abs/2503.00061)). The reliable controls are deterministic: a [least-privilege API key](../README.md#-security) so destructive calls cannot succeed at all, and a human-in-the-loop gate like this hook so a destructive call cannot run silently. These hold regardless of how convincing the injected text is.

## References

- Claude Code hooks — reference: <https://code.claude.com/docs/en/hooks> · guide: <https://code.claude.com/docs/en/hooks-guide>
- Claude Code permissions: <https://code.claude.com/docs/en/permissions>
- MCP tools spec (annotations are client-side hints): <https://modelcontextprotocol.io/specification/2025-06-18/server/tools>
- Lethal trifecta (Simon Willison): <https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/>
- Adaptive attacks break IPI defenses (Zhan et al., NAACL 2025): <https://arxiv.org/abs/2503.00061>
