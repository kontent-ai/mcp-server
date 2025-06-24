import { createDeliveryClient } from "@kontent-ai/delivery-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-item-dapi",
    "Get Kontent.ai item by codename from Delivery API",
    {
      codename: z.string().describe("Codename of the item to get"),
      environmentId: z
        .string()
        .describe("Environment ID of the item's environment"),
    },
    async ({ codename, environmentId }) => {
      const client = createDeliveryClient({
        environmentId,
      });

      const response = await client.item(codename).toPromise();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data.item),
          },
        ],
      };
    },
  );
};
