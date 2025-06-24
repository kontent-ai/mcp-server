import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-taxonomy-groups-mapi",
    "Get all taxonomy groups from Management API",
    {},
    async () => {
      const client = createMapiClient();

      const response = await client.listTaxonomies().toPromise();

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
