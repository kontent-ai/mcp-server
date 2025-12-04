import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { listVariantsCollectionSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-variants-collection-mapi",
    "List Kontent.ai language variants by collection from Management API (paginated)",
    listVariantsCollectionSchema.describe(
      "Use list-collections-mapi to get collection ID if not provided",
    ).shape,
    async (
      { collectionId, continuation_token },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client
          .listLanguageVariantsByCollection()
          .byCollectionId(collectionId);

        const response = await (continuation_token
          ? query.xContinuationToken(continuation_token)
          : query
        ).toPromise();

        return createMcpToolSuccessResponse({
          variants: response.rawData.variants,
          pagination: {
            continuation_token: response.data.pagination.continuationToken,
          },
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Collection Variants Listing");
      }
    },
  );
};
