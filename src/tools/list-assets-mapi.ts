import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-assets-mapi",
    "Get all assets from Management API",
    {},
    async () => {
      const client = createMapiClient();

      const response = await client.listAssets().toAllPromise();

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
