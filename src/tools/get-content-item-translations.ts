import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  bulkGetContentItemVariantsToolName,
  listContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentItemTranslations = defineReadOnlyTool(
  "get-content-item-translations",
  `Get all Kontent.ai content item translations — every language version (variant) of a specific content item. Retrieve translated content across all languages to examine details of a specific item in translation scenarios, rather than to search for items — for finding or disambiguating among candidates, use ${listContentItemVariantsToolName}'s search_phrase filter, or ${bulkGetContentItemVariantsToolName} to resolve several candidate IDs at once.`,
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
