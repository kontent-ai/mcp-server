import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-taxonomy-group-mapi",
    "Get Kontent.ai taxonomy group by ID",
    {
      id: z.string().describe("Taxonomy group ID"),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .getTaxonomy()
          .byTaxonomyId(id)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Group Retrieval");
      }
    },
  );
};
