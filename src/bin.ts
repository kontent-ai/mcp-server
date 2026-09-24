#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "dotenv/config";
import packageJson from "../package.json" with { type: "json" };
import { createApp } from "./app.js";
import { createAuth0Auth } from "./auth/auth0.js";
import { createServer } from "./server.js";
import {
  initializeApplicationInsights,
  trackException,
  trackServerStartup,
} from "./telemetry/applicationInsights.js";
import { throwError } from "./utils/throwError.js";

const version = packageJson.version;

process.env.NODE_ENV = process.env.NODE_ENV || "production";

async function startStreamableHTTP() {
  const PORT = process.env.PORT || 3001;
  const resourceServerUrl = new URL(
    process.env.MCP_SERVER_URL || `http://localhost:${PORT}`,
  );
  const domain =
    process.env.AUTH0_DOMAIN ?? "login.devkontentmasters.com"/*
    throwError(
      "AUTH0_DOMAIN environment variable is required for the Streamable HTTP transport",
    )*/;
  const audience = process.env.AUTH0_AUDIENCE ?? resourceServerUrl.toString();

  const app = await createApp({
    createMcpServer: createServer,
    createTransport: () =>
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      }),
    createAuth: () =>
      createAuth0Auth({
        domain,
        audience,
        resourceServerUrl,
        resourceName: "Kontent.ai MCP Server",
      }),
  });

  app.listen(PORT, () => {
    console.log(
      `Kontent.ai MCP Server v${version} (Streamable HTTP) running on port ${PORT}.
Available endpoint:
/mcp (requires Auth0 Bearer authentication)`,
    );
  });
}

async function startStdio() {
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
