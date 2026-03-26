import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const getTypeSnippet = createTool(
  ...defineTool(
    "get-type-snippet",
    "Retrieve Kontent.ai content type snippet. Snippets are reusable, shared sets of elements included across multiple content types.",
    {
      id: z.string().describe("Snippet ID"),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

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
  ),
);
