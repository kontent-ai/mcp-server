#!/usr/bin/env node
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "dotenv/config";
import express from "express";
import packageJson from "../package.json" with { type: "json" };
import { createServer } from "./server.js";

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
    console.log("Received GET MCP request");
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
    console.log("Received DELETE MCP request");
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
      `Kontent.ai MCP Server v${version} (Streamable HTTP) running on port ${PORT}`,
    );
  });
}

async function startSSE() {
  const app = express();
  const { server } = createServer();

  let transport: SSEServerTransport;

  app.get("/sse", async (_req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `Kontent.ai MCP Server v${version} (SSE) running on port ${PORT}`,
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
