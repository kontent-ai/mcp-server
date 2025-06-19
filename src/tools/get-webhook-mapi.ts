import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from '../clients/kontentClients.js';
import { getWebhookParamsSchema } from '../schemas/webhookSchemas.js';

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-webhook-mapi",
    "Get a specific webhook by ID from Management API. Webhooks notify external systems about changes in your Kontent.ai project. Use this to inspect webhook configuration, check health status, and review trigger settings.",
    getWebhookParamsSchema.shape,
    async ({ id }) => {
      const client = createMapiClient();

      const response = await client
        .getWebhook()
        .byId(id)
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