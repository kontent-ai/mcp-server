import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-content-item-mapi",
    "Add a new content item via Management API. This creates the content item structure but does not add content to language variants. Use upsert-language-variant-mapi to add content to the item.",
    {
      name: z
        .string()
        .min(1)
        .max(200)
        .describe("Display name of the content item (1-200 characters)"),
      type: z
        .object({
          id: z.string().optional(),
          codename: z.string().optional(),
          external_id: z.string().optional(),
        })
        .describe(
          "Reference to the content type by id, codename, or external_id. At least one property must be specified.",
        ),
      codename: z
        .string()
        .optional()
        .describe(
          "Codename of the content item (optional, will be generated from name if not provided)",
        ),
      external_id: z
        .string()
        .optional()
        .describe(
          "External ID for the content item (optional, useful for external system integration)",
        ),
      collection: z
        .object({
          id: z.string().optional(),
          codename: z.string().optional(),
          external_id: z.string().optional(),
        })
        .optional()
        .describe(
          "Reference to a collection by id, codename, or external_id (optional)",
        ),
    },
    async ({ name, type, codename, external_id, collection }) => {
      const client = createMapiClient();

      const response = await client
        .addContentItem()
        .withData({
          name,
          type,
          codename,
          external_id,
          collection,
        })
        .toPromise();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.rawData),
          },
        ],
      };
    },
  );
};
