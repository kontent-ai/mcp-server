import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import helmet from "helmet";
import packageJson from "../package.json" with { type: "json" };
import { trackException } from "./telemetry/applicationInsights.js";
import { sanitizeErrorForLog } from "./telemetry/telemetrySanitizer.js";
import { extractBearerToken } from "./utils/extractBearerToken.js";
import { isValidGuid } from "./utils/isValidGuid.js";

const version = packageJson.version;

// body-parser's 100 KB default is too small for rich text with embedded
// components. 4 MB leaves room for the largest content item variant the
// Management API accepts, including multi-byte characters and JSON escaping.
// Larger requests would be rejected by the Management API anyway.
export const MAX_REQUEST_BODY_BYTES = 4 * 1024 * 1024;

export type CreateAppDeps = {
  readonly createMcpServer: () => { server: McpServer };
  readonly createTransport: () => StreamableHTTPServerTransport;
};

export const createApp = ({
  createMcpServer,
  createTransport,
}: CreateAppDeps): express.Express => {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: MAX_REQUEST_BODY_BYTES }));

  app.post("/:environmentId/mcp", async (req, res) => {
    try {
      const { environmentId } = req.params;
      if (!isValidGuid(environmentId)) {
        res.status(400).json({
          error: "Invalid environment ID format. Must be a valid GUID.",
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

      const { server } = createMcpServer();
      const transport = createTransport();
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(
        Object.assign(req, {
          auth: {
            clientId: environmentId,
            token: authToken,
            scopes: [],
          },
        }),
        res,
        req.body,
      );
    } catch (error) {
      console.error("Error handling MCP request:", sanitizeErrorForLog(error));
      trackException(error, "MCP Multi-tenant Request Handler");
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

  app.get("/health", (_, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      currentVersion: version,
    });
  });

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      trackException(err, "Express Error Handler");
      if (!res.headersSent) {
        const status = (err as { status?: number }).status ?? 500;
        res.status(status).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    },
  );

  return app;
};
