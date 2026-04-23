import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getPublishedContentItemVariantVersion = defineTool(
  "get-published-content-item-variant-version",
  "Retrieve the published version of a Kontent.ai content item variant (live content). Use when a newer draft version exists but you need the currently published content. Returns the variant snapshot that is live on the Delivery API.",
  {
    itemId: z.string().describe("Content item ID"),
    languageId: z.string().describe("Language ID"),
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

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(
        error,
        "Published Content Item Variant Version Retrieval",
      );
    }
  },
);
