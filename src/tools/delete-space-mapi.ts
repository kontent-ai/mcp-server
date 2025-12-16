import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-space-mapi",
    "Delete Kontent.ai space",
    {
      id: z.string(),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        await client.deleteSpace().bySpaceId(id).toPromise();

        return createMcpToolSuccessResponse({
          message: `Space '${id}' deleted successfully`,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Space Deletion");
      }
    },
  );
};
