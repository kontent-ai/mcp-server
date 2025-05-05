import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createDeliveryClient } from '@kontent-ai/delivery-sdk';
import { registerCreateItemVariantTool } from './tools/createItemVariant.js';

// Create server instance
const server = new McpServer({
  name: "kontent-ai",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register get-item tool
server.tool(
  "get-item",
  "Get Kontent.ai item by codename",
  {
    codename: z.string().describe("Codename of the item to get"),
    environmentId: z.string().describe("Environment ID of the item's environment"),
  },
  async ({ codename, environmentId }) => {
    const client = createDeliveryClient({
      environmentId, 
    });

    const response = await client
      .item(codename)
      .toPromise();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data.item),
        },
      ],
    };
  }
);

// Register create-item-variant tool
registerCreateItemVariantTool(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kontent.ai MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

