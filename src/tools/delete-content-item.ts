import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteContentItem = defineDestructiveTool(
  "delete-content-item",
  "Delete (remove) Kontent.ai content item and all its content item variants.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Content item ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

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
);
