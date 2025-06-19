import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from '../clients/kontentClients.js';
import { addWebhookSchema } from '../schemas/webhookSchemas.js';

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-webhook-mapi",
    "Create a new webhook via Management API. Webhooks notify external systems about changes in your Kontent.ai project such as content publishing, updates, or deletions. Configure triggers for specific content types, assets, taxonomy groups, languages, or content items.",
    addWebhookSchema.shape,
    async (webhookData) => {
      const client = createMapiClient();

      const response = await client
        .addWebhook()
        .withData(webhookData)
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