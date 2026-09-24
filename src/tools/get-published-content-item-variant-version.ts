import { z } from "zod";
import {
  agentMetadataHeader,
  createMapiClient,
} from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getPublishedContentItemVariantVersion = defineReadOnlyTool(
  "get-published-content-item-variant-version",
  "Retrieve the published (live) version and details of a Kontent.ai content item variant, exactly as served on the Delivery API right now, even when a newer draft version exists.",
  {
    environmentId: environmentIdSchema,
    itemId: z.guid().describe("Content item ID"),
    languageId: z.guid().describe("Language ID"),
  },
  async (
    { environmentId, itemId, languageId },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client
        .viewLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(languageId)
        .published()
        .withHeader(agentMetadataHeader)
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
