import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-taxonomy-groups-mapi",
    "Get all Kontent.ai taxonomy groups from Management API",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listTaxonomies().toAllPromise();

        const rawData = response.responses.flatMap((r) => r.rawData.taxonomies);

        return createMcpToolSuccessResponse(rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Groups Listing");
      }
    },
  );
};
