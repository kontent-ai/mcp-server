import * as assert from "node:assert";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, it } from "mocha";
import { allTools } from "../../tools/index.js";

// Guards against the easy mistake of adding a new tool file under src/tools but
// forgetting to register it in src/tools/index.ts (allTools) — or leaving a
// registry entry behind after deleting a tool. We discover every tool
// definition on disk and require allTools to match it exactly.

const here = dirname(fileURLToPath(import.meta.url));
// Compiled location is build/test/tools — the tools live at build/tools.
const toolsDir = join(here, "..", "..", "tools");

const collectJsFiles = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
    } else if (entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
};

// Duck-types a ToolDefinition so the scan picks up tools without matching any
// helper export (name constants, factories, the allTools object itself).
const isToolDefinition = (value: unknown): value is { name: string } => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const annotations = candidate.annotations;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.handler === "function" &&
    typeof annotations === "object" &&
    annotations !== null &&
    "readOnlyHint" in annotations &&
    "destructiveHint" in annotations
  );
};

describe("allTools registry", () => {
  it("lists every tool defined under src/tools — none forgotten, none stale", async () => {
    const discovered = new Set<string>();
    for (const file of collectJsFiles(toolsDir)) {
      const module = await import(pathToFileURL(file).href);
      for (const exported of Object.values(module)) {
        if (isToolDefinition(exported)) {
          discovered.add(exported.name);
        }
      }
    }

    const discoveredNames = [...discovered].sort();
    const registeredNames = Object.values(allTools)
      .map((tool) => tool.name)
      .sort();

    assert.deepStrictEqual(
      registeredNames,
      discoveredNames,
      "allTools (src/tools/index.ts) must list every tool defined under src/tools and nothing that no longer exists",
    );
  });
});
