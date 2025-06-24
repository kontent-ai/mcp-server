import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-variant-mapi",
    "Get language variant of a content item from Management API",
    {
      itemCodename: z.string().describe("Codename of the content item"),
      languageCodename: z
        .string()
        .describe("Codename of the language variant to get"),
    },
    async ({ itemCodename, languageCodename }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .viewLanguageVariant()
          .byItemCodename(itemCodename)
          .byLanguageCodename(languageCodename)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Language Variant Retrieval");
      }
    },
  );
};
