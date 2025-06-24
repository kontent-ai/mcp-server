import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-asset-mapi",
    "Get a specific asset by codename from Management API",
    {
      assetCodename: z.string().describe("Codename of the asset to retrieve"),
    },
    async ({ assetCodename }) => {
      const client = createMapiClient();

      const response = await client
        .viewAsset()
        .byAssetCodename(assetCodename)
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
