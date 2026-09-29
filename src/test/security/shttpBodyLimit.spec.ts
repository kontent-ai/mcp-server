import * as assert from "node:assert";
import { describe, it } from "mocha";
import { MAX_REQUEST_BODY_BYTES } from "../../app.js";
import {
  type Captured,
  createCounters,
  postMcp,
  VALID_GUID,
  withServer,
  workingDeps,
} from "./shttpTestServer.js";

// Before the limit was set explicitly, body-parser's 100 KB default rejected
// rich text with embedded components with 413.

const authorized = { authorization: "Bearer test-key" };

// A tools/call message whose serialized form is exactly `bytes` long.
const toolCallOfSize = (bytes: number): string => {
  const envelope = (padding: string) =>
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "update-content-item-variant", arguments: { padding } },
    });
  const body = envelope("x".repeat(bytes - envelope("").length));
  assert.strictEqual(Buffer.byteLength(body), bytes);
  return body;
};

describe("shttp request body limit", () => {
  it("accepts a body above the former 100 KB default", async () => {
    const counters = createCounters();
    const captured: Captured = {};
    await withServer(workingDeps(counters, captured), async (baseUrl) => {
      const body = toolCallOfSize(150 * 1024);
      const response = await postMcp(baseUrl, VALID_GUID, authorized, body);
      assert.strictEqual(response.status, 204);
      assert.deepStrictEqual(captured.body, JSON.parse(body));
    });
  });

  it("accepts a body of exactly the limit", async () => {
    const counters = createCounters();
    await withServer(workingDeps(counters, {}), async (baseUrl) => {
      const response = await postMcp(
        baseUrl,
        VALID_GUID,
        authorized,
        toolCallOfSize(MAX_REQUEST_BODY_BYTES),
      );
      assert.strictEqual(response.status, 204);
    });
  });

  it("rejects a body over the limit with 413", async () => {
    const counters = createCounters();
    await withServer(workingDeps(counters, {}), async (baseUrl) => {
      const response = await postMcp(
        baseUrl,
        VALID_GUID,
        authorized,
        toolCallOfSize(MAX_REQUEST_BODY_BYTES + 1),
      );
      assert.strictEqual(response.status, 413);
      assert.strictEqual(counters.mcpServer, 0);
    });
  });
});
