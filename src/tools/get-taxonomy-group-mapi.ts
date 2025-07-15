import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-taxonomy-group-mapi",
    "Get Kontent.ai taxonomy group by internal ID from Management API",
    {
      id: z.string().describe("Internal ID of the taxonomy group to get"),
    },
    async ({ id }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .getTaxonomy()
          .byTaxonomyId(id)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Group Retrieval");
      }
    },
  );
};
