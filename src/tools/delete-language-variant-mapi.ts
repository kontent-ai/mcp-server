import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-language-variant-mapi",
    "Delete a language variant of a content item from Management API",
    {
      itemId: z.string().describe("Internal ID of the content item"),
      languageId: z
        .string()
        .describe("Internal ID of the language variant to delete"),
    },
    async ({ itemId, languageId }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .deleteLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Language variant '${languageId}' of content item '${itemId}' deleted successfully`,
          deletedVariant: response.data,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Language Variant Deletion");
      }
    },
  );
};
