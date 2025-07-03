import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { initialContext } from "./context/initial-context.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-initial-context",
    "🚨 MANDATORY FIRST STEP: This tool MUST be called before using ANY other tools. It provides essential context, configuration, and operational guidelines for Kontent.ai. If you have not called this tool, do so immediately before proceeding with any other operation.",
    {},
    async () => {
      try {
        return createMcpToolSuccessResponse(initialContext);
      } catch (error) {
        throw new Error(
          `Failed to read initial context: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
};
