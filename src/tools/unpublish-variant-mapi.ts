import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "unpublish-variant-mapi",
    "Unpublish or schedule unpublishing of Kontent.ai variant",
    {
      itemId: z.string().uuid().describe("Content item UUID"),
      languageId: z
        .string()
        .uuid()
        .describe(
          "Language variant UUID (default: 00000000-0000-0000-0000-000000000000)",
        ),
      scheduledTo: z
        .string()
        .datetime({ offset: true })
        .optional()
        .describe(
          "ISO 8601 datetime for scheduled unpublish (omit for immediate)",
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
            "The 'displayTimezone' parameter can only be used in combination with 'scheduledTo' parameter for scheduled unpublishing.",
          );
        }

        let action: string;
        let message: string;

        if (scheduledTo) {
          // Scheduled unpublishing
          const requestData: any = {
            scheduled_to: scheduledTo,
          };

          // Add display_timezone if provided
          if (displayTimezone) {
            requestData.display_timezone = displayTimezone;
          }

          await client
            .unpublishLanguageVariant()
            .byItemId(itemId)
            .byLanguageId(languageId)
            .withData(requestData)
            .toPromise();

          action = "scheduled for unpublishing";
          message = `Successfully scheduled language variant '${languageId}' for content item '${itemId}' to be unpublished at '${scheduledTo}'${displayTimezone ? ` (timezone: ${displayTimezone})` : ""}. The content will be removed from Delivery API at the scheduled time.`;
        } else {
          // Immediate unpublishing
          await client
            .unpublishLanguageVariant()
            .byItemId(itemId)
            .byLanguageId(languageId)
            .withoutData()
            .toPromise();

          action = "unpublished";
          message = `Successfully unpublished language variant '${languageId}' for content item '${itemId}'. The content has been moved to Archived and is no longer available through Delivery API.`;
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
        return handleMcpToolError(
          error,
          "Unpublish/Schedule Unpublishing Language Variant",
        );
      }
    },
  );
};
