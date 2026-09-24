import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteContentItemVariant = defineDestructiveTool(
  "delete-content-item-variant",
  "Delete (remove) Kontent.ai content item variant (language version/translation). Removes translated content for a specific language from an item.",
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
