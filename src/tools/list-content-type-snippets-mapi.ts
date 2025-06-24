import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-content-type-snippets-mapi",
    "Get all content type snippets from Management API",
    {},
    async () => {
      const client = createMapiClient();

      const response = await client.listContentTypeSnippets().toAllPromise();

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
