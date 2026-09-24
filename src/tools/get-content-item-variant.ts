import { z } from "zod";
import {
  agentMetadataHeader,
  createMapiClient,
} from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentItemVariant = defineReadOnlyTool(
  "get-content-item-variant",
  `Retrieve a single Kontent.ai content item variant (language version/translation) by item and language ID. Returns the current version — draft if one exists, otherwise published.`,
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
        .withHeader(agentMetadataHeader)
        .toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Item Variant Retrieval");
    }
  },
);
