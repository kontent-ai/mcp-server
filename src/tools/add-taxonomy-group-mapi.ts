import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { taxonomyGroupSchemas } from "../schemas/taxonomySchemas.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-taxonomy-group-mapi",
    "Add a new taxonomy group via Management API",
    taxonomyGroupSchemas,
    async (taxonomyGroup) => {
      const client = createMapiClient();

      const response = await client
        .addTaxonomy()
        .withData(taxonomyGroup)
        .toPromise();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data),
          },
        ],
      };
    },
  );
};
