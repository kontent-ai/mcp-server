import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getContentItemVariants = defineTool(
  "get-content-item-variants",
  "List all Kontent.ai item variants (translations) — every language version of a content item. Retrieve translated content across all languages to see available translations for a single item.",
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
      return handleMcpToolError(error, "Item Variants Listing");
    }
  },
);
