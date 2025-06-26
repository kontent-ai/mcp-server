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
      itemCodename: z.string().describe("Codename of the content item"),
      languageCodename: z
        .string()
        .describe("Codename of the language variant to delete"),
    },
    async ({ itemCodename, languageCodename }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .deleteLanguageVariant()
          .byItemCodename(itemCodename)
          .byLanguageCodename(languageCodename)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Language variant '${languageCodename}' of content item '${itemCodename}' deleted successfully`,
          deletedVariant: response.data,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Language Variant Deletion");
      }
    },
  );
};
