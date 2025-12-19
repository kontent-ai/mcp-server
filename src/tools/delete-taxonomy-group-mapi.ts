import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-taxonomy-group-mapi",
    "Delete Kontent.ai taxonomy group by ID",
    {
      id: z.guid(),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        await client.deleteTaxonomy().byTaxonomyId(id).toPromise();

        return createMcpToolSuccessResponse({
          message: `Taxonomy group '${id}' deleted successfully`,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Taxonomy Group Deletion");
      }
    },
  );
};
