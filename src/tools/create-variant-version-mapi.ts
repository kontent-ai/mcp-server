import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "create-variant-version-mapi",
    "Create new version of Kontent.ai variant",
    {
      itemId: z.guid().describe("Content item UUID"),
      languageId: z
        .guid()
        .describe(
          "Language variant UUID (default: 00000000-0000-0000-0000-000000000000)",
        ),
    },
    async ({ itemId, languageId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .createNewVersionOfLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Successfully created new version of language variant '${languageId}' for content item '${itemId}'`,
          result: response.rawData,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Variant Version Creation");
      }
    },
  );
};
