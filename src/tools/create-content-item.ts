import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { writeReferenceObjectSchema } from "../schemas/referenceObjectSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createContentItemVariantToolName } from "./referencedToolNames.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createContentItem = defineAdditiveTool(
  "create-content-item",
  `Create (add) new Kontent.ai content item (creates the container only, use ${createContentItemVariantToolName} to add language versions/translations). Items are language-neutral and hold content item variants for each language.`,
  {
    name: z.string().min(1).max(200).describe("Item name (1-200 chars)"),
    type: writeReferenceObjectSchema.describe(
      "Reference to the content type this item is an instance of.",
    ),
    codename: z
      .string()
      .optional()
      .describe("Codename (auto-generated if omitted)"),
    external_id: z.string().optional().describe("External ID"),
    collection: writeReferenceObjectSchema
      .optional()
      .describe("Reference to the collection this item belongs to."),
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
);
