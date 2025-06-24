#!/usr/bin/env node
import "dotenv/config";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import packageJson from "../package.json" with { type: "json" };
import { createServer } from "./server.js";

const version = packageJson.version;

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
    (transportType !== "stdio" && transportType !== "sse")
  ) {
    console.error("Please specify a valid transport type: stdio or sse");
    process.exit(1);
  }

  if (transportType === "stdio") {
    await startStdio();
  } else if (transportType === "sse") {
    await startSSE();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
