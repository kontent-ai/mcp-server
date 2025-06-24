import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-taxonomy-group-mapi",
    "Get taxonomy group by codename from Management API",
    {
      codename: z.string().describe("Codename of the taxonomy group to get"),
    },
    async ({ codename }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .getTaxonomy()
          .byTaxonomyCodename(codename)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Group Retrieval");
      }
    },
  );
};
