import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-content-item-mapi",
    "Delete a content item by codename from Management API",
    {
      codename: z.string().describe("Codename of the content item to delete"),
    },
    async ({ codename }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .deleteContentItem()
          .byItemCodename(codename)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content item '${codename}' deleted successfully`,
          deletedItem: response.data,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Content Item Deletion");
      }
    },
  );
};
