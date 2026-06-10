import * as assert from "node:assert";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { describe, it } from "mocha";
import { allTools } from "../../tools/index.js";

// The prompt-injection posture documented in the README rests on every tool
// being classified correctly into one of three kinds: read-only (no mutation),
// additive (only adds, never overwrites/removes), or destructive (may overwrite
// or remove). These tests pin that down across the whole tool set.

type ToolKind = "read-only" | "additive" | "destructive" | "unknown";

// Action prefixes from the enforced `[action]-[entity]` tool naming convention.
const READ_ONLY_PREFIXES = ["bulk-get-", "get-", "list-", "search-"];
const ADDITIVE_PREFIXES = ["create-"];
const DESTRUCTIVE_PREFIXES = [
  "change-",
  "delete-",
  "patch-",
  "publish-",
  "unpublish-",
  "update-",
];

// Tools whose action does not match what their prefix implies.
const NAME_EXCEPTIONS: Record<string, ToolKind> = {
  // Upserts a language variant: overwrites the existing one if present, so it is
  // destructive despite the additive-sounding "create-" prefix.
  "create-content-item-variant": "destructive",
};

const expectedKindFromName = (name: string): ToolKind => {
  const exception = NAME_EXCEPTIONS[name];
  if (exception !== undefined) {
    return exception;
  }
  if (READ_ONLY_PREFIXES.some((prefix) => name.startsWith(prefix))) {
    return "read-only";
  }
  if (ADDITIVE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
    return "additive";
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
  // readOnlyHint: false — additive and destructive differ only by destructiveHint.
  return annotations.destructiveHint === true ? "destructive" : "additive";
};

describe("tool annotations", () => {
  it("every tool has a valid read-only / additive / destructive combo", () => {
    // The only valid (readOnlyHint, destructiveHint) pairs: read-only is (true,
    // false), additive is (false, false), destructive is (false, true). A
    // read-only tool can never also be destructive.
    const allowed = [
      { readOnlyHint: true, destructiveHint: false },
      { readOnlyHint: false, destructiveHint: false },
      { readOnlyHint: false, destructiveHint: true },
    ];
    for (const tool of Object.values(allTools)) {
      const { readOnlyHint, destructiveHint } = tool.annotations;
      assert.ok(
        allowed.some(
          (combo) =>
            combo.readOnlyHint === readOnlyHint &&
            combo.destructiveHint === destructiveHint,
        ),
        `tool '${tool.name}' has an invalid annotation combo (readOnlyHint=${readOnlyHint}, destructiveHint=${destructiveHint})`,
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
        `tool '${tool.name}' has an unrecognized action prefix; add it to READ_ONLY_PREFIXES, ADDITIVE_PREFIXES, DESTRUCTIVE_PREFIXES, or NAME_EXCEPTIONS`,
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
