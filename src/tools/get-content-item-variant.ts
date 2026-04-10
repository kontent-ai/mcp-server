import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getContentItemVariant = defineTool(
  "get-content-item-variant",
  "Retrieve Kontent.ai content item variant (language version/translation). Returns the current version of the variant — draft if one exists, otherwise published. Variants hold translated, language-specific content with structure defined by content type.",
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
        .toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Item Variant Retrieval");
    }
  },
);
