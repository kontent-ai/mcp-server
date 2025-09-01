import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "list-assets-mapi",
    "Get all Kontent.ai assets from Management API",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token, config);

      try {
        const response = await client.listAssets().toAllPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Assets Listing");
      }
    },
  );
};
