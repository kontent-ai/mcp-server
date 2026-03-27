import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getLatestItemVariant = defineTool(
  "get-latest-item-variant",
  "Retrieve latest version of Kontent.ai item variant (draft or published). Variants hold translated, language-specific content with structure defined by content type.",
  {
    itemId: z.string().describe("Item ID"),
    languageId: z.string().describe("Language variant ID"),
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
      return handleMcpToolError(error, "Latest Language Variant Retrieval");
    }
  },
);
