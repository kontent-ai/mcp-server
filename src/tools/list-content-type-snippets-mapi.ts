import { createMapiClient } from "../clients/kontentClients.js";
import { listContentTypeSnippetsSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listContentTypeSnippetsMapi = createTool(
  ...defineTool(
    "list-content-type-snippets-mapi",
    "List all Kontent.ai content type snippets (paginated). Snippets are reusable, shared sets of elements included across multiple content types.",
    listContentTypeSnippetsSchema.shape,
    async ({ continuation_token }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client.listContentTypeSnippets();

        const response = await (continuation_token
          ? query.xContinuationToken(continuation_token)
          : query
        ).toPromise();

        return createMcpToolSuccessResponse({
          data: response.rawData.snippets,
          pagination: {
            continuation_token: response.data.pagination.continuationToken,
          },
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Content Type Snippets Listing");
      }
    },
  ),
);
