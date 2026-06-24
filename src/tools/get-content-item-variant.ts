import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentItemVariant = defineReadOnlyTool(
  "get-content-item-variant",
  `Retrieve a single Kontent.ai content item variant (language version/translation) by item and language ID. Returns the current version — draft if one exists, otherwise published. The response includes 'agent_metadata.editability': 'is_editable' plus plain-text 'guidance' naming the operation required first when the variant is not directly editable.`,
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
        .withAgentMetadata()
        .toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Item Variant Retrieval");
    }
  },
);
