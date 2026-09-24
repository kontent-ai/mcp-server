import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type RequestHandler } from "express";
import helmet from "helmet";
import packageJson from "../package.json" with { type: "json" };
import { trackException } from "./telemetry/applicationInsights.js";

const version = packageJson.version;

export type CreateAppDeps = {
  readonly createMcpServer: () => { server: McpServer };
  readonly createTransport: () => StreamableHTTPServerTransport;
  readonly createAuth: () => Promise<{
    readonly metadataRouter: RequestHandler;
    readonly authMiddleware: RequestHandler;
  }>;
};

export const createApp = async ({
  createMcpServer,
  createTransport,
  createAuth,
}: CreateAppDeps): Promise<express.Express> => {
  const app = express();
  app.use(helmet());
  app.use(express.json());

  const { metadataRouter, authMiddleware } = await createAuth();
  app.use(metadataRouter);

  app.post("/mcp", authMiddleware, async (req, res) => {
    try {
      const { server } = createMcpServer();
      const transport = createTransport();
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
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
