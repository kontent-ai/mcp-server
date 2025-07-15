import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-workflows-mapi",
    "Get all Kontent.ai workflows from Management API. Workflows define the content lifecycle stages and transitions between them.",
    {},
    async () => {
      const client = createMapiClient();

      try {
        const response = await client.listWorkflows().toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Workflows Listing");
      }
    },
  );
};
