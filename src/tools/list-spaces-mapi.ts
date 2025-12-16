import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-spaces-mapi",
    "List all Kontent.ai spaces. Spaces provide channel-specific context for managing multiple websites/channels. Each space has its own domain and preview URLs; collections connect to spaces to organize content per channel.",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listSpaces().toPromise();
        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Spaces Listing");
      }
    },
  );
};
