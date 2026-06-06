import * as assert from "node:assert";
import { describe, it } from "mocha";
import { createServer } from "../../server.js";
import { allTools } from "../../tools/index.js";

// Every tool — including the destructive ones — is always registered, on every
// transport; createServer applies no tool filtering.
describe("createServer", () => {
  it("builds a server with all tools available (no tool filtering)", () => {
    assert.ok(createServer().server);
    assert.ok(Object.values(allTools).length > 0);
  });
});

// defineReadOnlyTool/defineDestructiveTool guarantee annotations at compile time;
// this guards the registered tool set end to end.
describe("tool annotations", () => {
  it("every tool is explicitly read-only or destructive", () => {
    for (const tool of Object.values(allTools)) {
      assert.ok(
        tool.annotations.readOnlyHint === true ||
          tool.annotations.destructiveHint === true,
        `tool '${tool.name}' must declare readOnlyHint or destructiveHint`,
      );
    }
  });
});
