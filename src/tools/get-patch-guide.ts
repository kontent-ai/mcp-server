import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { patchOperationsGuide } from "./context/patch-operations-guide.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-patch-guide",
    "REQUIRED before using patch-content-type-mapi, patch-collections-mapi, or patch-language-mapi. Provides JSON Patch operations guide.",
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
