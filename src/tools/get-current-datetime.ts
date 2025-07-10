import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-current-datetime",
    "Get the current date and time in UTC (ISO-8601 format)",
    {},
    async () => {
      const now = new Date();

      return createMcpToolSuccessResponse({
        datetime: now.toISOString(),
      });
    },
  );
};
