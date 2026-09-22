import * as assert from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "mocha";

// SE-325 item 3. The fail-closed behaviour of the Streamable HTTP transport
// rests on one invariant: the server reads credentials from the environment in
// exactly one place, the stdio startup in bin.ts. These assertions fail the
// build if a future change puts an ambient credential read back anywhere else.
//
// The scan is over the compiled output, matching src/test/tools/allTools.spec.ts
// and covering what actually ships. A dynamically built name
// (process.env["KONTENT" + "_API_KEY"]) would slip past the first assertion;
// the second one is the backstop for the realistic case.

const here = dirname(fileURLToPath(import.meta.url));
// Compiled location is build/test/security - the build root is two levels up.
const buildDir = join(here, "..", "..");
const testDir = join(buildDir, "test");

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

// The specs themselves name the very things being forbidden.
const shippedJsFiles = (): string[] =>
  collectJsFiles(buildDir).filter((file) => !file.startsWith(testDir));

const toRelativePaths = (files: string[]): string[] =>
  files.map((file) => relative(buildDir, file).split(sep).join("/")).sort();

const filesContaining = (pattern: RegExp): string[] =>
  toRelativePaths(
    shippedJsFiles().filter((file) =>
      pattern.test(readFileSync(file, "utf-8")),
    ),
  );

describe("no ambient credentials", () => {
  it("reads the credential environment variables only in bin.js", () => {
    assert.deepStrictEqual(
      filesContaining(/KONTENT_API_KEY|KONTENT_ENVIRONMENT_ID/),
      ["bin.js"],
      "Credentials must come from the request or from the single-tenant credentials bin.js configures. A comment mentioning these variables counts too - tsc keeps comments, so update the wording instead of reintroducing the read.",
    );
  });

  it("keeps tool modules free of environment access", () => {
    assert.deepStrictEqual(
      filesContaining(/process\.env/).filter((file) =>
        file.startsWith("tools/"),
      ),
      [],
      "Tool modules must take their configuration from their arguments; the entry point owns the environment.",
    );
  });

  it("configures the single-tenant credentials only from the entry point", () => {
    assert.deepStrictEqual(
      filesContaining(/setSingleTenantCredentials/),
      ["bin.js", "clients/credentials.js"],
      "Only the stdio composition root may configure single-tenant credentials - anything else can hand the Streamable HTTP transport a fallback it must not have.",
    );
  });
});
