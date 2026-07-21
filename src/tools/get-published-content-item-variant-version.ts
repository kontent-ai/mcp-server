import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getPublishedContentItemVariantVersion = defineReadOnlyTool(
  "get-published-content-item-variant-version",
  "Retrieve the published (live) version and details of a Kontent.ai content item variant, exactly as served on the Delivery API right now, even when a newer draft version exists.",
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
