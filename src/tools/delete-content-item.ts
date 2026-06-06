import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createUntrustedContentResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteContentItem = defineDestructiveTool(
  "delete-content-item",
  "Delete (remove) Kontent.ai content item and all its content item variants.",
  {
    id: z.string().describe("Content item ID"),
  },
  async ({ id }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .deleteContentItem()
        .byItemId(id)
        .toPromise();

      return createUntrustedContentResponse({
        message: `Content item '${id}' deleted successfully`,
        deletedItem: response.rawData,
      });
    } catch (error: any) {
      return handleMcpToolError(error, "Content Item Deletion");
    }
  },
  { idempotent: true },
);
