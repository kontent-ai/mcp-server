#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "dotenv/config";
import packageJson from "../package.json" with { type: "json" };
import { createApp } from "./app.js";
import { setSingleTenantCredentials } from "./clients/credentials.js";
import { createServer } from "./server.js";
import {
  flushTelemetry,
  initializeApplicationInsights,
  trackException,
  trackServerStartup,
} from "./telemetry/applicationInsights.js";
import { sanitizeErrorForLog } from "./telemetry/telemetrySanitizer.js";

const version = packageJson.version;

process.env.NODE_ENV = process.env.NODE_ENV || "production";

/**
 * Flushes buffered telemetry, then exits. Telemetry is batched, so an exit without this drops
 * whatever was tracked immediately beforehand. Never rejects.
 */
let exiting = false;

const exitAfterFlush = async (code: number): Promise<void> => {
  // Re-entrancy guard: two concurrent flushes race, the second resolves immediately with
  // "no data to send", and its process.exit kills the first one's in-flight POST - losing
  // everything the flush existed to deliver.
  if (exiting) {
    return;
  }
  exiting = true;

  await flushTelemetry();
  process.exit(code);
};

async function startStreamableHTTP() {
  const app = createApp({
    createMcpServer: createServer,
    createTransport: () =>
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      }),
  });

  const PORT = process.env.PORT || 3001;
  const httpServer = app.listen(PORT, (error?: Error) => {
    // Express forwards a listen failure to this callback. Without the guard the process claims
    // "running on port N" on stdout and then reports the failure on stderr.
    if (error) {
      return;
    }

    console.log(
      `Kontent.ai MCP Server v${version} (Streamable HTTP) running on port ${PORT}.
Available endpoint:
/{environmentId}/mcp (requires Bearer authentication)`,
    );
  });

  // Express registers its own one-shot 'error' listener for the listen callback, so a listen
  // failure (EADDRINUSE is the common one) was previously swallowed: no diagnostic, the failure
  // itself untracked, and an exit code of 0 that an orchestrator reads as success.
  httpServer.on("error", (error) => {
    console.error("HTTP server error:", sanitizeErrorForLog(error));

    // A server that is already listening emits 'error' for accept failures (EMFILE/ENFILE).
    // Those are transient - shed the connection, do not kill a healthy process.
    const isStartupFailure = !httpServer.listening;
    trackException(
      error,
      isStartupFailure ? "Server Startup" : "Server Runtime",
    );

    if (isStartupFailure) {
      void exitAfterFlush(1);
    }
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

  // The client closing stdin ends the session. StdioServerTransport registers only 'data' and
  // 'error' on stdin, so `transport.close()` is never called on EOF and the process would
  // otherwise sit on the telemetry SDK's batch timer for ~15s instead of exiting.
  process.stdin.once("end", () => {
    void exitAfterFlush(0);
  });

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
    // Not exitAfterFlush(): `process.exit` returns `never`, which is what narrows
    // `transportType` to "stdio" | "shttp" for the branch below.
    await flushTelemetry();
    process.exit(1);
  }

  if (transportType === "stdio") {
    await startStdio();
  } else if (transportType === "shttp") {
    await startStreamableHTTP();
  }
}

main().catch(async (error) => {
  try {
    console.error("Fatal error:", sanitizeErrorForLog(error));
    trackException(error, "Server Startup");
  } finally {
    // In `finally` so that an EPIPE from the console write cannot skip the flush.
    await flushTelemetry();
    process.exit(1);
  }
});
