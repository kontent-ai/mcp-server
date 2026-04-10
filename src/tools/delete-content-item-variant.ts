import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const deleteContentItemVariant = defineTool(
  "delete-content-item-variant",
  "Delete (remove) Kontent.ai content item variant (language version/translation). Removes translated content for a specific language from an item.",
  {
    itemId: z.string().describe("Content item ID"),
    languageId: z.string().describe("Language ID"),
  },
  async ({ itemId, languageId }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .deleteLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(languageId)
        .toPromise();

      return createMcpToolSuccessResponse({
        message: `Language variant '${languageId}' of content item '${itemId}' deleted successfully`,
        deletedVariant: response.rawData,
      });
    } catch (error: any) {
      return handleMcpToolError(error, "Language Variant Deletion");
    }
  },
);
