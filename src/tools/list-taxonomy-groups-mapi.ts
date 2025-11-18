import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { listTaxonomyGroupsSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-taxonomy-groups-mapi",
    "Get all Kontent.ai taxonomy groups (paginated)",
    listTaxonomyGroupsSchema.shape,
    async ({ continuation_token }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client.listTaxonomies();

        const response = await (continuation_token
          ? query.xContinuationToken(continuation_token)
          : query
        ).toPromise();

        return createMcpToolSuccessResponse({
          data: response.rawData.taxonomies,
          pagination: {
            continuation_token: response.data.pagination.continuationToken,
          },
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Groups Listing");
      }
    },
  );
};
