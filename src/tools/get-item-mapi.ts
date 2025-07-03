import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-item-mapi",
    "Get Kontent.ai item by internal ID from Management API",
    {
      id: z.string().describe("Internal ID of the item to get"),
    },
    async ({ id }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .viewContentItem()
          .byItemId(id)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Item Retrieval");
      }
    },
  );
};
