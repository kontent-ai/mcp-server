import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-initial-context",
    "🚨 MANDATORY FIRST STEP: This tool MUST be called before using ANY other tools. It provides essential context, configuration, and operational guidelines for Kontent.ai. If you have not called this tool, do so immediately before proceeding with any other operation.",
    {},
    async () => {
      try {
        const markdownPath = join(
          __dirname,
          "./context/get-initial-context.md",
        );
        const kontentaiInstructions = await readFile(markdownPath, "utf-8");
        return createMcpToolSuccessResponse(kontentaiInstructions);
      } catch (error) {
        throw new Error(
          `Failed to read initial context: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  );
};
