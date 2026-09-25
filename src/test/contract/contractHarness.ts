import {
  createServer as createHttpServer,
  type IncomingMessage,
  type Server,
} from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createApp } from "../../app.js";
import { createServer } from "../../server.js";

// Contract tests run the real server (the Express app, the MCP server with every tool and the
// Streamable HTTP transport, as bin.ts wires them) against a stub Management API. They assert two
// things a unit test of a schema cannot: what the model receives back from a tool call, and what the
// tool actually sent to the Management API.

export const contractEnvironmentId = "11111111-2222-4333-8444-555555555555";

export type RecordedRequest = {
  readonly method: string;
  readonly path: string;
  readonly body: unknown;
};

export type StubReply = {
  readonly status: number;
  readonly body: unknown;
};

// The shape of a Management API error, so the tool's own error handling runs as in production.
export const stubErrorReply: StubReply = {
  status: 400,
  body: {
    request_id: "contract-stub",
    error_code: 0,
    message: "Stub Management API",
  },
};

type ContractContext = {
  readonly client: Client;
  readonly requests: ReadonlyArray<RecordedRequest>;
};

const readBody = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const listen = async (server: Server): Promise<string> => {
  if (!server.listening) {
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
  }
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
};

const close = (server: Server): Promise<void> => {
  server.closeAllConnections();
  // Resolve regardless: a teardown error would replace the assertion failure that caused it.
  return new Promise((resolve) => server.close(() => resolve()));
};

export const withContractServer = async (
  reply: (request: RecordedRequest) => StubReply,
  run: (context: ContractContext) => Promise<void>,
): Promise<void> => {
  const requests: RecordedRequest[] = [];
  const managementApi = createHttpServer(async (request, response) => {
    const recorded = {
      method: request.method ?? "",
      path: request.url ?? "",
      body: await readBody(request),
    };
    requests.push(recorded);
    const { status, body } = reply(recorded);
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  }).listen(0, "127.0.0.1");

  const app = createApp({
    createMcpServer: createServer,
    createTransport: () =>
      new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }),
  }).listen(0, "127.0.0.1");

  const previousManageApiUrl = process.env.manageApiUrl;
  const client = new Client({ name: "contract-tests", version: "1.0.0" });
  try {
    // createMapiClient appends "v2" to this value without a separator.
    process.env.manageApiUrl = `${await listen(managementApi)}/`;
    const appUrl = await listen(app);
    await client.connect(
      new StreamableHTTPClientTransport(
        new URL(`${appUrl}/${contractEnvironmentId}/mcp`),
        {
          requestInit: {
            headers: { authorization: "Bearer contract-test-key" },
          },
        },
      ),
    );
    await run({ client, requests });
  } finally {
    await client.close().catch(() => {});
    if (previousManageApiUrl === undefined) {
      delete process.env.manageApiUrl;
    } else {
      process.env.manageApiUrl = previousManageApiUrl;
    }
    await close(app);
    await close(managementApi);
  }
};

export const resultText = (result: Awaited<ReturnType<Client["callTool"]>>) =>
  (result.content as ReadonlyArray<{ type: string; text?: string }>)
    .map((part) => part.text ?? "")
    .join("\n");
