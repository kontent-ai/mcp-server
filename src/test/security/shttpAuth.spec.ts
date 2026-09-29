import * as assert from "node:assert";
import { describe, it } from "mocha";
import {
  type Captured,
  createCounters,
  postMcp,
  rejectingDeps,
  VALID_GUID,
  withServer,
  workingDeps,
} from "./shttpTestServer.js";

// On the Streamable HTTP transport, neither the McpServer nor its transport may
// be constructed before the authorization check has passed. A status assertion
// alone cannot show that, so the tests below inject counting factories and
// assert they were never called.

describe("shttp authorization ordering", () => {
  it("rejects a missing Authorization header without building a server", async () => {
    const counters = createCounters();
    await withServer(rejectingDeps(counters), async (baseUrl) => {
      const response = await postMcp(baseUrl, VALID_GUID);
      assert.strictEqual(response.status, 401);
      assert.deepStrictEqual(await response.json(), {
        error: "Authorization header with Bearer token is required.",
      });
      assert.strictEqual(counters.mcpServer, 0);
      assert.strictEqual(counters.transport, 0);
    });
  });

  it("rejects a non-Bearer Authorization header without building a server", async () => {
    const counters = createCounters();
    await withServer(rejectingDeps(counters), async (baseUrl) => {
      const response = await postMcp(baseUrl, VALID_GUID, {
        authorization: "Basic dXNlcjpwYXNz",
      });
      assert.strictEqual(response.status, 401);
      assert.strictEqual(counters.mcpServer, 0);
      assert.strictEqual(counters.transport, 0);
    });
  });

  it("rejects a malformed environment ID without building a server", async () => {
    const counters = createCounters();
    await withServer(rejectingDeps(counters), async (baseUrl) => {
      const response = await postMcp(baseUrl, "not-a-guid", {
        authorization: "Bearer test-key",
      });
      assert.strictEqual(response.status, 400);
      assert.deepStrictEqual(await response.json(), {
        error: "Invalid environment ID format. Must be a valid GUID.",
      });
      assert.strictEqual(counters.mcpServer, 0);
      assert.strictEqual(counters.transport, 0);
    });
  });

  it("builds the server once and forwards auth and parsed body when authorized", async () => {
    const counters = createCounters();
    const captured: Captured = {};
    await withServer(workingDeps(counters, captured), async (baseUrl) => {
      const response = await postMcp(baseUrl, VALID_GUID, {
        authorization: "Bearer test-key",
      });
      assert.strictEqual(response.status, 204);
      assert.strictEqual(counters.mcpServer, 1);
      assert.strictEqual(counters.transport, 1);
      // Every tool handler reads authInfo.token/clientId, so pin the shape the
      // relocated authorization block produces.
      assert.deepStrictEqual(captured.auth, {
        clientId: VALID_GUID,
        token: "test-key",
        scopes: [],
      });
      // Pins that a JSON body parser ran at all: without one the SDK silently
      // falls back to reading the raw stream with no size limit.
      assert.deepStrictEqual(captured.body, {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      });
    });
  });
});
