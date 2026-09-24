import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentTypeSnippet = defineReadOnlyTool(
  "get-content-type-snippet",
  "Retrieve Kontent.ai content type snippet. Snippets are reusable, shared sets of elements included across multiple content types.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Content type snippet ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client
        .viewContentTypeSnippet()
        .byTypeId(id)
        .toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Content Type Snippet Retrieval");
    }
  },
);
