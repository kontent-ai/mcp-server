import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const deleteContentItem = createTool(
  ...defineTool(
    "delete-content-item",
    "Delete (remove) Kontent.ai content item and all its item variants.",
    {
      id: z.string().describe("Item ID"),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .deleteContentItem()
          .byItemId(id)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content item '${id}' deleted successfully`,
          deletedItem: response.rawData,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Content Item Deletion");
      }
    },
  ),
);
