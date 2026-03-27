import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const getTypeSnippetMapi = createTool(
  ...defineTool(
    "get-type-snippet-mapi",
    "Get Kontent.ai content type snippet. Snippets are reusable element sets included in content types via snippet element.",
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
