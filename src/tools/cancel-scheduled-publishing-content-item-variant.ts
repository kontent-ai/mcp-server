import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { cancelScheduledPublishingContentItemVariantToolName } from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const cancelScheduledPublishingContentItemVariant =
  defineDestructiveTool(
    cancelScheduledPublishingContentItemVariantToolName,
    "Cancel scheduled publishing of a Kontent.ai content item variant (language version/translation). Reverts a variant that is scheduled to publish back to its previous workflow step so it can be edited again. Use this before updating a variant that is in the Scheduled workflow step.",
    {
      itemId: z.guid().describe("Content item ID"),
      languageId: z
        .guid()
        .describe(
          "Language ID (default: 00000000-0000-0000-0000-000000000000)",
        ),
    },
    async ({ itemId, languageId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        await client
          .cancelSheduledPublishingOfLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Successfully canceled scheduled publishing of item variant '${languageId}' for content item '${itemId}'. The variant is no longer scheduled and can now be updated.`,
        });
      } catch (error: unknown) {
        return handleMcpToolError(
          error,
          "Cancel Scheduled Publishing of Language Variant",
        );
      }
    },
  );
