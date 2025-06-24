import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-item-mapi",
    "Get Kontent.ai item by codename from Management API",
    {
      codename: z.string().describe("Codename of the item to get"),
    },
    async ({ codename }) => {
      const client = createMapiClient();

      const response = await client
        .viewContentItem()
        .byItemCodename(codename)
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
