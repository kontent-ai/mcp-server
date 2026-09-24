import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { listContentItemVariantsToolName } from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentItem = defineReadOnlyTool(
  "get-content-item",
  `Retrieve (fetch) a single Kontent.ai content item by ID — returns its details: name, codename, and content type. Items are language-neutral containers; one item has multiple content item variants (translations). Do NOT call this in a loop to identify an item among several candidates by name — narrow down first with ${listContentItemVariantsToolName}'s search_phrase filter.`,
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Content item ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.viewContentItem().byItemId(id).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Item Retrieval");
    }
  },
);
