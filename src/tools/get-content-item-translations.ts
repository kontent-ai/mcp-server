import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getContentItemTranslations = defineTool(
  "get-content-item-translations",
  "Get all Kontent.ai content item translations — every language version (variant) of a specific content item. Retrieve translated content across all languages to see available translations for a single item.",
  {
    itemId: z.string().describe("Content item ID"),
  },
  async ({ itemId }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .listLanguageVariantsOfItem()
        .byItemId(itemId)
        .toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Item Translations Retrieval");
    }
  },
);
