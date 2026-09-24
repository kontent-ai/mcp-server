import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteContentType = defineDestructiveTool(
  "delete-content-type",
  "Delete (remove) Kontent.ai content type by ID. Removes the schema/model definition.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Content type ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client
        .deleteContentType()
        .byTypeId(id)
        .toPromise();

      return createMcpToolSuccessResponse({
        message: `Content type '${id}' deleted successfully`,
        deletedType: response.rawData,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Type Deletion");
    }
  },
);
