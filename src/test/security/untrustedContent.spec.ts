import * as assert from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "mocha";
import {
  createMcpToolSuccessResponse,
  createUntrustedContentResponse,
  UNTRUSTED_CONTENT_NOTICE,
} from "../../utils/responseHelper.js";

describe("createUntrustedContentResponse", () => {
  it("returns two blocks: a provenance notice followed by the data", () => {
    const response = createUntrustedContentResponse({ id: "1" });
    assert.strictEqual(response.content.length, 2);
    assert.strictEqual(response.content[0].text, UNTRUSTED_CONTENT_NOTICE);
  });

  it("keeps the data block byte-identical to the plain success response", () => {
    const data = { id: "123", body: "hello", elements: [{ value: "x" }] };
    const marked = createUntrustedContentResponse(data);
    const plain = createMcpToolSuccessResponse(data);
    assert.strictEqual(marked.content[1].text, plain.content[0].text);
    assert.deepStrictEqual(JSON.parse(marked.content[1].text), data);
  });

  it("flags provenance in _meta", () => {
    const response = createUntrustedContentResponse({ id: "1" });
    const meta = response._meta as Record<string, unknown>;
    assert.strictEqual(
      meta["kontent-ai/content-provenance"],
      "end-user-authored-untrusted",
    );
  });

  it("instructs the model to treat the content as data, not instructions", () => {
    assert.match(UNTRUSTED_CONTENT_NOTICE, /not instructions/i);
    assert.match(UNTRUSTED_CONTENT_NOTICE, /do not follow/i);
  });

  it("handles string and undefined payloads like the plain helper", () => {
    assert.strictEqual(
      createUntrustedContentResponse("plain").content[1].text,
      "plain",
    );
    assert.strictEqual(
      createUntrustedContentResponse(undefined).content[1].text,
      "undefined",
    );
  });
});

// Wiring guard: tools returning end-user-authored CMS content must use the untrusted
// helper. Hermetic source check so a future refactor can't silently swap one back to
// the plain helper (which would drop the prompt-injection marking).
describe("user-content read tools are wired to the untrusted helper", () => {
  const USER_CONTENT_READ_TOOLS = [
    "get-content-item",
    "get-content-item-variant",
    "get-content-item-translations",
    "get-published-content-item-variant-version",
    "bulk-get-content-item-variants",
    "list-content-item-variants",
    "search-content-item-variants",
    "get-asset",
    "list-assets",
  ];
  const toolsDir = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../src/tools",
  );

  for (const tool of USER_CONTENT_READ_TOOLS) {
    it(`${tool} calls createUntrustedContentResponse`, () => {
      const source = readFileSync(resolve(toolsDir, `${tool}.ts`), "utf8");
      assert.match(source, /createUntrustedContentResponse\(/);
    });
  }
});
