import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-assets-mapi",
    "Get all Kontent.ai assets",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listAssets().toAllPromise();

        const rawData = response.responses.flatMap((r) => r.rawData.assets);

        return createMcpToolSuccessResponse(rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Assets Listing");
      }
    },
  );
};
