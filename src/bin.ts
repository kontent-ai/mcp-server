#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "dotenv/config";
import packageJson from "../package.json" with { type: "json" };
import { createApp } from "./app.js";
import { setSingleTenantCredentials } from "./clients/credentials.js";
import { createServer } from "./server.js";
import {
  initializeApplicationInsights,
  trackException,
  trackServerStartup,
} from "./telemetry/applicationInsights.js";

const version = packageJson.version;

process.env.NODE_ENV = process.env.NODE_ENV || "production";

async function startStreamableHTTP() {
  const app = createApp({
    createMcpServer: createServer,
    createTransport: () =>
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      }),
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `Kontent.ai MCP Server v${version} (Streamable HTTP) running on port ${PORT}.
Available endpoint:
/{environmentId}/mcp (requires Bearer authentication)`,
    );
  });
}

async function startStdio() {
  const apiKey = process.env.KONTENT_API_KEY;
  const environmentId = process.env.KONTENT_ENVIRONMENT_ID;
  if (apiKey && environmentId) {
    setSingleTenantCredentials({ apiKey, environmentId });
  }

  const { server } = createServer();
  const transport = new StdioServerTransport();
  console.error(`Kontent.ai MCP Server v${version} (stdio) starting`);
  await server.connect(transport);
}

async function main() {
  initializeApplicationInsights();
  trackServerStartup(version);

  const args = process.argv.slice(2);
  const transportType = args[0]?.toLowerCase();

  if (
    !transportType ||
    (transportType !== "stdio" && transportType !== "shttp")
  ) {
    console.error("Please specify a valid transport type: stdio or shttp");
    process.exit(1);
  }

  if (transportType === "stdio") {
    await startStdio();
  } else if (transportType === "shttp") {
    await startStreamableHTTP();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  trackException(error, "Server Startup");
  process.exit(1);
});
