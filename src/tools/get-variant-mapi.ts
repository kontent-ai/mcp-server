import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-variant-mapi",
    "Get Kontent.ai language variant of content item from Management API",
    {
      itemId: z.string().describe("Internal ID of the content item"),
      languageId: z
        .string()
        .describe("Internal ID of the language variant to get"),
    },
    async ({ itemId, languageId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .viewLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Language Variant Retrieval");
      }
    },
  );
};
