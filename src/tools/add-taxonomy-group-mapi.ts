import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { taxonomyGroupSchemas } from "../schemas/taxonomySchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "add-taxonomy-group-mapi",
    "Add new Kontent.ai taxonomy group via Management API",
    taxonomyGroupSchemas,
    async (taxonomyGroup, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token, config);

      try {
        const response = await client
          .addTaxonomy()
          .withData(taxonomyGroup)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Group Creation");
      }
    },
  );
};
