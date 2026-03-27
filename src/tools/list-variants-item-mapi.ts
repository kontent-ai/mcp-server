import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listVariantsItemMapi = createTool(
  ...defineTool(
    "list-variants-item-mapi",
    "List all Kontent.ai language variants of a content item from Management API",
    {
      itemId: z.string().describe("Content item ID"),
    },
    async ({ itemId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .listLanguageVariantsOfItem()
          .byItemId(itemId)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Item Variants Listing");
      }
    },
  ),
);
