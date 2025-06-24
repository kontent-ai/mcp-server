import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-type-snippet-mapi",
    "Get content type snippet by codename from Management API",
    {
      codename: z
        .string()
        .describe("Codename of the content type snippet to get"),
    },
    async ({ codename }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .viewContentTypeSnippet()
          .byTypeCodename(codename)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Content Type Snippet Retrieval");
      }
    },
  );
};
