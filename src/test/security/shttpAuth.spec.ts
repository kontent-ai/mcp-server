import * as assert from "node:assert";
import type { AddressInfo } from "node:net";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Response } from "express";
import { describe, it } from "mocha";
import { type CreateAppDeps, createApp } from "../../app.js";

// On the Streamable HTTP transport, neither the McpServer nor its transport may
// be constructed before the authorization check has passed. A status assertion
// alone cannot show that, so the tests below inject counting factories and
// assert they were never called.

const VALID_GUID = "00000000-0000-0000-0000-000000000000";

type Counters = {
  mcpServer: number;
  transport: number;
};

const createCounters = (): Counters => ({ mcpServer: 0, transport: 0 });

// Both factories count and then throw: if the ordering ever regresses, the run
// fails loudly on the counter as well as on the status code.
const rejectingDeps = (counters: Counters): CreateAppDeps => ({
  createMcpServer: () => {
    counters.mcpServer++;
    throw new Error("createMcpServer must not run before authorization");
  },
  createTransport: () => {
    counters.transport++;
    throw new Error("createTransport must not run before authorization");
  },
});

type Captured = {
  auth?: unknown;
  body?: unknown;
};

const workingDeps = (
  counters: Counters,
  captured: Captured,
): CreateAppDeps => ({
  createMcpServer: () => {
    counters.mcpServer++;
    return {
      server: {
        connect: async () => {},
        close: () => {},
      } as unknown as McpServer,
    };
  },
  createTransport: () => {
    counters.transport++;
    return {
      handleRequest: async (
        req: { auth?: unknown },
        res: Response,
        body: unknown,
      ) => {
        captured.auth = req.auth;
        captured.body = body;
        res.status(204).end();
      },
      close: () => {},
    } as unknown as StreamableHTTPServerTransport;
  },
});

// A fresh app per test keeps counters isolated. The teardown sits in `finally`
// because mocha runs without `--exit`: a failed assertion that skipped it would
// leave the listener holding the event loop open and hang the run.
const withServer = async (
  deps: CreateAppDeps,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> => {
  const server = createApp(deps).listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const { port } = server.address() as AddressInfo;
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => {
      // Resolve regardless: a teardown error is never the signal worth reading,
      // and rejecting here would replace the assertion failure that caused it.
      server.close(() => resolve());
    });
  }
};

const postMcp = (
  baseUrl: string,
  environmentId: string,
  headers: Record<string, string> = {},
): Promise<globalThis.Response> =>
  fetch(`${baseUrl}/${environmentId}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });

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
