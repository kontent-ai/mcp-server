import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-roles-mapi",
    "Get all Kontent.ai roles",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listRoles().toPromise();

        return createMcpToolSuccessResponse(response.rawData.roles);
      } catch (error: any) {
        return handleMcpToolError(error, "Roles Listing");
      }
    },
  );
};
