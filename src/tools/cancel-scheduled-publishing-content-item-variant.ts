import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const cancelScheduledPublishingContentItemVariant =
  defineDestructiveTool(
    "cancel-scheduled-publishing-content-item-variant",
    "Cancel scheduled publishing of Kontent.ai content item variant (language version/translation). Reverts variant back to previous workflow step, enabling further edits.",
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

        const message = `Successfully canceled scheduled publishing for item variant '${languageId}' of content item '${itemId}'. The variant has been reverted to its previous workflow step and can now be edited.`;

        return createMcpToolSuccessResponse({
          message,
          result: {
            itemId,
            languageId,
            action: "canceled_scheduled_publishing",
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Cancel Scheduled Publishing");
      }
    },
  );
