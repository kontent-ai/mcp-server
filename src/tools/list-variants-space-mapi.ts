import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { listVariantsSpaceSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-variants-space-mapi",
    "List Kontent.ai language variants by space from Management API (paginated)",
    listVariantsSpaceSchema.shape,
    async (
      { spaceId, continuation_token },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client.listLanguageVariantsBySpace().bySpaceId(spaceId);

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
        return handleMcpToolError(error, "Space Variants Listing");
      }
    },
  );
};
