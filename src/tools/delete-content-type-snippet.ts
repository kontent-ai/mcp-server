import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const deleteContentTypeSnippet = defineTool(
  "delete-content-type-snippet",
  "Delete (remove) Kontent.ai content type snippet by internal ID. Removes the reusable shared element set definition.",
  {
    id: z.string().describe("Content type snippet internal ID"),
  },
  async ({ id }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      await client.deleteContentTypeSnippet().byTypeId(id).toPromise();

      return createMcpToolSuccessResponse({
        message: `Content type snippet '${id}' deleted successfully`,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Type Snippet Deletion");
    }
  },
);
