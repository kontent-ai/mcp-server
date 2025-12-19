import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { patchOperationsGuide } from "./context/patch-operations-guide.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-patch-guide",
    "REQUIRED before any patch operation. Get patch operations guide for Kontent.ai Management API.",
    {},
    async () => {
      try {
        return createMcpToolSuccessResponse(patchOperationsGuide);
      } catch (error) {
        throw new Error(
          `Failed to read patch guide: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
};
