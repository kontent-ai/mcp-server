import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "publish-variant-mapi",
    "Publish or schedule a language variant of a content item in Kontent.ai. This operation can either immediately publish the variant (publishing happens right now) or schedule it for publication at a specific future date and time. For immediate publishing: the variant is published immediately and becomes available through the Delivery API. For scheduled publishing: the variant moves to a 'Scheduled' workflow state and will automatically transition to 'Published' at the specified time. The variant must be in a valid state with all required fields filled and validation rules satisfied. A variant can only be published if a transition is defined between the variant's current workflow step and the Published workflow step.",
    {
      itemId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the content item whose language variant you want to publish or schedule. This identifies the content item container that holds all language variants.",
        ),
      languageId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the language variant to publish or schedule. Use '00000000-0000-0000-0000-000000000000' for the default language. Each language in your project has a unique ID that identifies the specific variant.",
        ),
      scheduledTo: z
        .string()
        .datetime({ offset: true })
        .optional()
        .describe(
          "ISO 8601 formatted date and time when the publish action should occur (e.g., '2024-12-25T10:00:00Z' for UTC or '2024-12-25T10:00:00+02:00' for specific timezone). If not provided, the variant will be published immediately. If provided, must be a future date/time. The actual execution may have up to 5 minutes delay from the specified time.",
        ),
      displayTimezone: z
        .string()
        .optional()
        .describe(
          "The timezone identifier for displaying the scheduled time in the Kontent.ai UI (e.g., 'America/New_York', 'Europe/London', 'UTC'). This parameter is used for scheduled publishing to specify the timezone context for the scheduled_to parameter. If not provided, the system will use the default timezone. This helps content creators understand when content will be published in their local context.",
        ),
    },
    async ({ itemId, languageId, scheduledTo, displayTimezone }) => {
      const client = createMapiClient();

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
