import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { listAssetsSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-assets-mapi",
    "Get all Kontent.ai assets (paginated). Assets are digital files (images, videos, documents) referenced in content.",
    listAssetsSchema.shape,
    async ({ continuation_token }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client.listAssets();

        const response = await (continuation_token
          ? query.xContinuationToken(continuation_token)
          : query
        ).toPromise();

        return createMcpToolSuccessResponse({
          data: response.rawData.assets,
          pagination: {
            continuation_token: response.data.pagination.continuationToken,
          },
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Assets Listing");
      }
    },
  );
};
