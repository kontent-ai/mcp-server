import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-type-snippet-mapi",
    "Get content type snippet by codename from Management API",
    {
      codename: z
        .string()
        .describe("Codename of the content type snippet to get"),
    },
    async ({ codename }) => {
      const client = createMapiClient();

      const response = await client
        .viewContentTypeSnippet()
        .byTypeCodename(codename)
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
