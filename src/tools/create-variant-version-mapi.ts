import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "create-variant-version-mapi",
    "Create new version of Kontent.ai language variant via Management API. This operation creates a new version of an existing language variant, useful for content versioning and creating new drafts from published content.",
    {
      itemId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the content item whose language variant you want to create a new version of",
        ),
      languageId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the language variant to create a new version of. Use '00000000-0000-0000-0000-000000000000' for the default language",
        ),
    },
    async ({ itemId, languageId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token, config);

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
