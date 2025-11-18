import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "update-content-item-mapi",
    "Update Kontent.ai content item",
    {
      id: z.string().describe("Content item ID"),
      name: z
        .string()
        .min(1)
        .max(200)
        .optional()
        .describe("New name (1-200 chars)"),
      collection: z
        .object({
          id: z.string().optional(),
          codename: z.string().optional(),
          external_id: z.string().optional(),
        })
        .optional()
        .describe("Collection reference"),
    },
    async (
      { id, name, collection },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        // First, verify the item exists by trying to get it
        await client.viewContentItem().byItemId(id).toPromise();

        // If we get here, the item exists, so we can update it
        const updateData: any = {};

        if (name !== undefined) {
          updateData.name = name;
        }

        if (collection !== undefined) {
          updateData.collection = collection;
        }

        // If no update data is provided, return an error
        if (Object.keys(updateData).length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Update Content Item: No update data provided. At least one field (name or collection) must be specified.",
              },
            ],
            isError: true,
          };
        }

        const response = await client
          .upsertContentItem()
          .byItemId(id)
          .withData(updateData)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content item '${id}' updated successfully`,
          updatedItem: response.rawData,
        });
      } catch (error: any) {
        // Check if the error is because the item doesn't exist
        if (
          error?.response?.status === 404 ||
          error?.message?.includes("not found")
        ) {
          return {
            content: [
              {
                type: "text",
                text: `Update Content Item: Content item with ID '${id}' does not exist. Use add-content-item-mapi to create new items.`,
              },
            ],
            isError: true,
          };
        }

        return handleMcpToolError(error, "Content Item Update");
      }
    },
  );
};
