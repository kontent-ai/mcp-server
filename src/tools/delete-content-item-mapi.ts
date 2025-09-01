import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "delete-content-item-mapi",
    "Delete Kontent.ai content item by internal ID from Management API",
    {
      id: z.string().describe("Internal ID of the content item to delete"),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token, config);

      try {
        const response = await client
          .deleteContentItem()
          .byItemId(id)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content item '${id}' deleted successfully`,
          deletedItem: response.data,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Content Item Deletion");
      }
    },
  );
};
