import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteContentTypeSnippet = defineDestructiveTool(
  "delete-content-type-snippet",
  "Delete (remove) Kontent.ai content type snippet by ID. Removes the reusable shared element set definition.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Content type snippet ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

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
