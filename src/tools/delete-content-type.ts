import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const deleteContentType = defineTool(
  "delete-content-type",
  "Delete (remove) Kontent.ai content type by ID. Removes the schema/model definition.",
  {
    id: z.string().describe("Content type ID"),
  },
  async ({ id }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

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
