import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  bulkGetContentItemVariantsToolName,
  listContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentItem = defineReadOnlyTool(
  "get-content-item",
  `Retrieve (fetch) a single Kontent.ai content item by ID — returns its details: name, codename, and content type. Items are language-neutral containers; one item has multiple content item variants (translations). Do NOT call this in a loop to identify an item among several candidates by name — narrow down first with ${listContentItemVariantsToolName}'s search_phrase filter, or if you already have several candidate IDs, resolve them all in one call with ${bulkGetContentItemVariantsToolName} instead of calling this tool repeatedly.`,
  {
    id: z.string().describe("Content item ID"),
  },
  async ({ id }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client.viewContentItem().byItemId(id).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Item Retrieval");
    }
  },
);
