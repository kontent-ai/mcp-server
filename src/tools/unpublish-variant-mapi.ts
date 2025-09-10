import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "unpublish-variant-mapi",
    "Unpublish or schedule unpublishing of a language variant of a content item in Kontent.ai. This operation can either immediately unpublish the variant (making it unavailable through the Delivery API) or schedule it for unpublishing at a specific future date and time. For immediate unpublishing: the variant is unpublished right away and moves to the 'Archived' workflow step, becoming unavailable through the Delivery API. For scheduled unpublishing: the variant remains published but is scheduled to be automatically unpublished at the specified time. The variant must currently be in the 'Published' state for this operation to succeed.",
    {
      itemId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the content item whose language variant you want to unpublish or schedule for unpublishing. This identifies the content item container that holds all language variants.",
        ),
      languageId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the language variant to unpublish or schedule for unpublishing. Use '00000000-0000-0000-0000-000000000000' for the default language. Each language in your project has a unique ID that identifies the specific variant.",
        ),
      scheduledTo: z
        .string()
        .datetime({ offset: true })
        .optional()
        .describe(
          "ISO 8601 formatted date and time when the unpublish action should occur (e.g., '2024-12-25T10:00:00Z' for UTC or '2024-12-25T10:00:00+02:00' for specific timezone). If not provided, the variant will be unpublished immediately. If provided, must be a future date/time. The actual execution may have up to 5 minutes delay from the specified time. When unpublished, the content will no longer be available through the Delivery API.",
        ),
      displayTimezone: z
        .string()
        .optional()
        .describe(
          "The timezone identifier for displaying the scheduled time in the Kontent.ai UI (e.g., 'America/New_York', 'Europe/London', 'UTC'). This parameter is used for scheduled unpublishing to specify the timezone context for the scheduled_to parameter. If not provided, the system will use the default timezone. This helps content creators understand when content will be unpublished in their local context.",
        ),
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
