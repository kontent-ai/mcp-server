import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

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
        .string()
        .describe(
          'JSON string representing an array of element objects that define the structure of the content type snippet. Each element should have \'type\', \'name\' and other properties based on the element type. Example: \'[{"type": "text", "name": "Title", "is_required": true}, {"type": "rich_text", "name": "Content"}]\'',
        ),
    },
    async ({ name, codename, external_id, elements }) => {
      const client = createMapiClient();

      try {
        // Parse JSON string
        const parsedElements = JSON.parse(elements);

        const response = await client
          .addContentTypeSnippet()
          .withData(() => ({
            name,
            codename,
            external_id,
            elements: parsedElements,
          }))
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        if (error instanceof SyntaxError) {
          return {
            content: [
              {
                type: "text" as const,
                text: `JSON parsing error: ${error.message}. Please ensure 'elements' is a valid JSON string.`,
              },
            ],
            isError: true,
          };
        }
        return handleMcpToolError(error, "Content Type Snippet Creation");
      }
    },
  );
};
