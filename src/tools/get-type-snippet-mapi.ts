import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-type-snippet-mapi",
    "Get Kontent.ai content type snippet by internal ID from Management API",
    {
      id: z.string().describe("Internal ID of the content type snippet to get"),
    },
    async ({ id }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .viewContentTypeSnippet()
          .byTypeId(id)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Content Type Snippet Retrieval");
      }
    },
  );
};
