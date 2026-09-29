import type { AddressInfo } from "node:net";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Response } from "express";
import { type CreateAppDeps, createApp } from "../../app.js";

// Shared setup for specs that run the real Streamable HTTP app over a socket
// with injected MCP server and transport factories.

export const VALID_GUID = "00000000-0000-0000-0000-000000000000";

export type Counters = {
  mcpServer: number;
  transport: number;
};

export const createCounters = (): Counters => ({ mcpServer: 0, transport: 0 });

// Both factories count and then throw: if the ordering ever regresses, the run
// fails loudly on the counter as well as on the status code.
export const rejectingDeps = (counters: Counters): CreateAppDeps => ({
  createMcpServer: () => {
    counters.mcpServer++;
    throw new Error("createMcpServer must not run before authorization");
  },
  createTransport: () => {
    counters.transport++;
    throw new Error("createTransport must not run before authorization");
  },
});

export type Captured = {
  auth?: unknown;
  body?: unknown;
};

export const workingDeps = (
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
export const withServer = async (
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

export const postMcp = (
  baseUrl: string,
  environmentId: string,
  headers: Record<string, string> = {},
  body: string = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
  }),
): Promise<globalThis.Response> =>
  fetch(`${baseUrl}/${environmentId}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
