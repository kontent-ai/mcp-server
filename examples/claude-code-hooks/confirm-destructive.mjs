#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook for the Kontent.ai MCP server.
 *
 * Forces a human confirmation prompt before any destructive Kontent.ai tool runs,
 * regardless of what the model decided. This is a deterministic, local guard against
 * a destructive tool call triggered by prompt injection in CMS content — a model that
 * has been hijacked cannot disable it.
 *
 * Wire it up via .claude/settings.json (see docs/security-hooks.md). The matcher there
 * restricts this hook to destructive tools; this script reads the hook payload and
 * emits the "ask" decision that surfaces the confirmation dialog.
 *
 * To block such calls outright instead of prompting, change "ask" to "deny" below.
 */

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  let toolName = "a Kontent.ai tool";
  try {
    const payload = JSON.parse(raw);
    if (typeof payload.tool_name === "string") {
      toolName = payload.tool_name;
    }
  } catch {
    // If stdin isn't valid JSON we still fail safe by asking.
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          `'${toolName}' makes a destructive change in Kontent.ai. ` +
          "Confirm you requested this — not content returned by an earlier tool call (possible prompt injection).",
      },
    }),
  );
});
