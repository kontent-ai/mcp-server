import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "publish-variant-mapi",
    "Publish or schedule Kontent.ai variant",
    {
      itemId: z.uuid().describe("Content item UUID"),
      languageId: z.uuid()
        .describe(
          "Language variant UUID (default: 00000000-0000-0000-0000-000000000000)",
        ),
      scheduledTo: z.iso.datetime({ offset: true })
        .optional()
        .describe(
          "ISO 8601 datetime for scheduled publish (omit for immediate)",
        ),
      displayTimezone: z
        .string()
        .optional()
        .describe("Timezone for UI display (e.g., America/New_York, UTC)"),
    },
    async (
      { itemId, languageId, scheduledTo, displayTimezone },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        // Validate that displayTimezone can only be used with scheduledTo
        if (displayTimezone && !scheduledTo) {
          throw new Error(
            "The 'displayTimezone' parameter can only be used in combination with 'scheduledTo' parameter for scheduled publishing.",
          );
        }

        let action: string;
        let message: string;

        if (scheduledTo) {
          // Scheduled publishing
          const requestData: any = {
            scheduled_to: scheduledTo,
          };

          // Add display_timezone if provided
          if (displayTimezone) {
            requestData.display_timezone = displayTimezone;
          }

          await client
            .publishLanguageVariant()
            .byItemId(itemId)
            .byLanguageId(languageId)
            .withData(requestData)
            .toPromise();

          action = "scheduled";
          message = `Successfully scheduled language variant '${languageId}' for content item '${itemId}' to be published at '${scheduledTo}'${displayTimezone ? ` (timezone: ${displayTimezone})` : ""}.`;
        } else {
          // Immediate publishing
          await client
            .publishLanguageVariant()
            .byItemId(itemId)
            .byLanguageId(languageId)
            .withoutData()
            .toPromise();

          action = "published";
          message = `Successfully published language variant '${languageId}' for content item '${itemId}'. The content is now live and available through Delivery API.`;
        }

        return createMcpToolSuccessResponse({
          message,
          result: {
            itemId,
            languageId,
            scheduledTo: scheduledTo || null,
            displayTimezone: displayTimezone || null,
            action,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Publish/Schedule Language Variant");
      }
    },
  );
};
