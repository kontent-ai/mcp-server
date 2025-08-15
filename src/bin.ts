#!/usr/bin/env node
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "dotenv/config";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import packageJson from "../package.json" with { type: "json" };
import { createServer } from "./server.js";
import { extractBearerToken } from "./utils/extractBearerToken.js";
import { isValidGuid } from "./utils/isValidGuid.js";

const version = packageJson.version;

async function startStreamableHTTP() {
  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    try {
      const { server } = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (_, res) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      }),
    );
  });

  app.delete("/mcp", async (_, res) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      }),
    );
  });

  app.post("/:environmentId/mcp", async (req, res) => {
    try {
      const { environmentId } = req.params;
      if (!isValidGuid(environmentId)) {
        res.status(400).json({
          error: "Invalid environment ID format. Must be a valid GUID.",
        });
        return;
      }

      const { server } = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });

      const authToken = extractBearerToken(req);
      if (!authToken) {
        res.status(401).json({
          error: "Authorization header with Bearer token is required.",
        });
        return;
      }

      await server.connect(transport);
      await transport.handleRequest(Object.assign(req, {
          auth: {
            clientId: environmentId,
            token: authToken,
            scopes: [],
          },
        }), res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/:environmentId/mcp", async (_, res) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      }),
    );
  });

  app.delete("/:environmentId/mcp", async (_, res) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      }),
    );
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `Kontent.ai MCP Server v${version} (Streamable HTTP) running on port ${PORT}.
Available endpoints:
/mcp
/{environmentId}/mcp (requires Bearer authentication)`,
    );
  });
}

async function startSSE() {
  const app = express();

  // Keep separate instances for each environment
  const serversByEnvironment = new Map<string | null, McpServer>();
  const transportsByEnvironment = new Map<string | null, SSEServerTransport>();

  const close = (environmentId: string | null) => {
    const server = serversByEnvironment.get(environmentId);
    if (server) {
      server.server.close();
    }

    const transport = transportsByEnvironment.get(environmentId);
    if (transport) {
      transport.close();
    }
  };

  const connect = async (
    environmentId: string | null,
    endpoint: string,
    res: express.Response,
  ) => {
    const { server } = createServer();
    const transport = new SSEServerTransport(endpoint, res);

    serversByEnvironment.set(environmentId, server);
    transportsByEnvironment.set(environmentId, transport);

    await server.server.connect(transport);

    res.on("close", () => close(environmentId));
  };

  app.get("/sse", async (_req, res) => {
    await connect(null, "/message", res);
  });

  app.post("/message", async (req, res) => {
    const server = serversByEnvironment.get(null);
    const transport = transportsByEnvironment.get(null);

    if (!server || !transport) {
      res.status(404).json({
        error: "No active SSE connection found.",
      });
      return;
    }

    await transport.handlePostMessage(req, res);
  });

  // Routes for environment-specific SSE connections
  app.get("/:environmentId/sse", async (req, res) => {
    const { environmentId } = req.params;

    if (!isValidGuid(environmentId)) {
      res.status(400).json({
        error: "Invalid environment ID format. Must be a valid GUID.",
      });
      return;
    }

    await connect(environmentId, `/${environmentId}/message`, res);
  });

  app.post("/:environmentId/message", async (req, res) => {
    const { environmentId } = req.params;

    if (!isValidGuid(environmentId)) {
      res.status(400).json({
        error: "Invalid environment ID format. Must be a valid GUID.",
      });
      return;
    }

    const server = serversByEnvironment.get(environmentId);
    const transport = transportsByEnvironment.get(environmentId);

    if (!server || !transport) {
      res.status(404).json({
        error: "No active SSE connection found for this environment ID.",
      });
      return;
    }

    const authToken = extractBearerToken(req);
    if (!authToken) {
      res.status(401).json({
        error: "Authorization header with Bearer token is required.",
      });
      return;
    }

    await transport.handlePostMessage(
      Object.assign(req, {
        auth: {
          clientId: environmentId,
          token: authToken,
          scopes: [],
        },
      }),
      res,
    );
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `Kontent.ai MCP Server v${version} (SSE) running on port ${PORT}.
Available endpoints:
/sse
/{environmentId}/sse (requires Bearer authentication)`,
    );
  });
}

async function startStdio() {
  const { server } = createServer();
  const transport = new StdioServerTransport();
  console.log(`Kontent.ai MCP Server v${version} (stdio) starting`);
  await server.connect(transport);
}

async function main() {
  const args = process.argv.slice(2);
  const transportType = args[0]?.toLowerCase();

  if (
    !transportType ||
    (transportType !== "stdio" &&
      transportType !== "sse" &&
      transportType !== "shttp")
  ) {
    console.error(
      "Please specify a valid transport type: stdio, sse, or shttp",
    );
    process.exit(1);
  }

  if (transportType === "stdio") {
    await startStdio();
  } else if (transportType === "sse") {
    await startSSE();
  } else if (transportType === "shttp") {
    await startStreamableHTTP();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
