import * as assert from "node:assert";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { describe, it } from "mocha";
import { allTools } from "../../tools/index.js";

// The prompt-injection posture documented in the README rests on every tool
// being classified correctly as read-only or destructive. These tests pin that
// down across the whole tool set.

type ToolKind = "read-only" | "destructive" | "unknown";

// Action prefixes from the enforced `[action]-[entity]` tool naming convention.
const READ_ONLY_PREFIXES = ["bulk-get-", "get-", "list-", "search-"];
const DESTRUCTIVE_PREFIXES = [
  "change-",
  "create-",
  "delete-",
  "patch-",
  "publish-",
  "unpublish-",
  "update-",
];

const expectedKindFromName = (name: string): ToolKind => {
  if (READ_ONLY_PREFIXES.some((prefix) => name.startsWith(prefix))) {
    return "read-only";
  }
  if (DESTRUCTIVE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
    return "destructive";
  }
  return "unknown";
};

const actualKindFromAnnotations = (annotations: ToolAnnotations): ToolKind => {
  if (annotations.readOnlyHint === true) {
    return "read-only";
  }
  if (annotations.destructiveHint === true) {
    return "destructive";
  }
  return "unknown";
};

describe("tool annotations", () => {
  it("every tool declares exactly one of readOnlyHint / destructiveHint", () => {
    for (const tool of Object.values(allTools)) {
      const isReadOnly = tool.annotations.readOnlyHint === true;
      const isDestructive = tool.annotations.destructiveHint === true;
      // XOR: exactly one must hold — a tool that is neither (or both) is a bug.
      assert.ok(
        isReadOnly !== isDestructive,
        `tool '${tool.name}' must declare exactly one of readOnlyHint / destructiveHint (readOnlyHint=${tool.annotations.readOnlyHint}, destructiveHint=${tool.annotations.destructiveHint})`,
      );
    }
  });

  it("every tool is closed-world (operates only on the configured environment)", () => {
    for (const tool of Object.values(allTools)) {
      assert.strictEqual(
        tool.annotations.openWorldHint,
        false,
        `tool '${tool.name}' must set openWorldHint: false`,
      );
    }
  });

  it("annotation matches the action implied by the tool name", () => {
    for (const tool of Object.values(allTools)) {
      const expected = expectedKindFromName(tool.name);
      assert.notStrictEqual(
        expected,
        "unknown",
        `tool '${tool.name}' has an unrecognized action prefix; add it to READ_ONLY_PREFIXES or DESTRUCTIVE_PREFIXES`,
      );
      const actual = actualKindFromAnnotations(tool.annotations);
      assert.strictEqual(
        actual,
        expected,
        `tool '${tool.name}' is annotated ${actual} but its name implies ${expected}`,
      );
    }
  });
});
