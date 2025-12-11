import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createVariantMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-published-variant-mapi",
    "Get published Kontent.ai language variant. Variants hold language-specific content; structure defined by content type and its snippets.",
    {
      itemId: z.string().describe("Item ID"),
      languageId: z.string().describe("Language variant ID"),
    },
    async ({ itemId, languageId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .viewLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .published()
          .toPromise();

        return createVariantMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(
          error,
          "Published Language Variant Retrieval",
        );
      }
    },
  );
};
