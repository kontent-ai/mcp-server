import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from '../clients/kontentClients.js';

export const registerTool = (server: McpServer): void => {
  server.tool(
    "list-webhooks-mapi",
    "Get all webhooks from Management API. Webhooks are used to notify external systems about changes in your Kontent.ai project, such as content publishing, updates, or deletions.",
    {},
    async () => {
      const client = createMapiClient();

      const response = await client
        .listWebhooks()
        .toPromise();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    }
  );
}; 