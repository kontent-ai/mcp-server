import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { snippetElementSchema } from "../schemas/contentTypeSchemas.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-content-type-snippet-mapi",
    "Add a new content type snippet via Management API",
    {
      name: z.string().describe("Display name of the content type snippet"),
      codename: z
        .string()
        .optional()
        .describe(
          "Codename of the content type snippet (optional, will be generated if not provided)",
        ),
      external_id: z
        .string()
        .optional()
        .describe("External ID of the content type snippet (optional)"),
      elements: z
        .array(snippetElementSchema)
        .describe(
          "Array of elements that define the structure of the content type snippet",
        ),
    },
    async ({ name, codename, external_id, elements }) => {
      const client = createMapiClient();

      const response = await client
        .addContentTypeSnippet()
        .withData(() => ({
          name,
          codename,
          external_id,
          elements,
        }))
        .toPromise();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.rawData),
          },
        ],
      };
    },
  );
};
