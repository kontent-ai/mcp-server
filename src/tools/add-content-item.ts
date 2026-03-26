import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const addContentItem = createTool(
  ...defineTool(
    "add-content-item",
    "Create new Kontent.ai content item (creates the container only, use create-item-variant to add language versions/translations). Items are language-neutral and hold item variants for each language.",
    {
      name: z.string().min(1).max(200).describe("Item name (1-200 chars)"),
      type: z
        .object({
          id: z.string().optional(),
          codename: z.string().optional(),
          external_id: z.string().optional(),
        })
        .describe("Content type reference"),
      codename: z
        .string()
        .optional()
        .describe("Codename (auto-generated if omitted)"),
      external_id: z.string().optional().describe("External ID"),
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
      { name, type, codename, external_id, collection },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
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

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Content Item Creation");
      }
    },
  ),
);
