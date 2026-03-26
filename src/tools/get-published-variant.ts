import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const getPublishedVariant = createTool(
  ...defineTool(
    "get-published-variant",
    "Retrieve published Kontent.ai language variant (live content). Variants hold translated, language-specific content with structure defined by content type.",
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
          .published()
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(
          error,
          "Published Language Variant Retrieval",
        );
      }
    },
  ),
);
