import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-content-types-mapi",
    "Get all Kontent.ai content types",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listContentTypes().toAllPromise();

        const rawData = response.responses.flatMap((r) => r.rawData.types);

        return createMcpToolSuccessResponse(rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Content Types Listing");
      }
    },
  );
};
