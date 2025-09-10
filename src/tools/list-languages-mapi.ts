import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-languages-mapi",
    "Get all Kontent.ai languages from Management API",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listLanguages().toAllPromise();

        const rawData = response.responses.flatMap((r) => r.rawData.languages);

        return createMcpToolSuccessResponse(rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Languages Listing");
      }
    },
  );
};
