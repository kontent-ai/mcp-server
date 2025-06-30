import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-content-type-mapi",
    "Add a new content type via Management API",
    {
      name: z.string().describe("Display name of the content type"),
      codename: z
        .string()
        .optional()
        .describe(
          "Codename of the content type (optional, will be generated if not provided)",
        ),
      external_id: z
        .string()
        .optional()
        .describe("External ID of the content type (optional)"),
      elements: z
        .string()
        .describe(
          'JSON string representing an array of element objects that define the structure of the content type. Each element should have \'type\', \'name\' and other properties based on the element type. Example: \'[{"type": "text", "name": "Title", "is_required": true}, {"type": "rich_text", "name": "Content"}]\'',
        ),
      content_groups: z
        .string()
        .optional()
        .describe(
          'JSON string representing an array of content group objects (optional). Example: \'[{"name": "General", "codename": "general"}]\'',
        ),
    },
    async ({ name, codename, external_id, elements, content_groups }) => {
      const client = createMapiClient();

      try {
        // Parse JSON strings
        const parsedElements = JSON.parse(elements);
        const parsedContentGroups = content_groups
          ? JSON.parse(content_groups)
          : undefined;

        const response = await client
          .addContentType()
          .withData(() => ({
            name,
            codename,
            external_id,
            elements: parsedElements,
            content_groups: parsedContentGroups,
          }))
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        if (error instanceof SyntaxError) {
          return {
            content: [
              {
                type: "text" as const,
                text: `JSON parsing error: ${error.message}. Please ensure 'elements' and 'content_groups' (if provided) are valid JSON strings.`,
              },
            ],
            isError: true,
          };
        }
        return handleMcpToolError(error, "Content Type Creation");
      }
    },
  );
};
