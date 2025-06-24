import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-languages-mapi",
    "Get all languages from Management API",
    {},
    async () => {
      const client = createMapiClient();

      const response = await client.listLanguages().toAllPromise();

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
