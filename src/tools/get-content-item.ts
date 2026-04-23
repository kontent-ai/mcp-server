import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getContentItem = defineTool(
  "get-content-item",
  "Retrieve Kontent.ai content item by ID. Items are language-neutral containers; one item has multiple content item variants (translations).",
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
