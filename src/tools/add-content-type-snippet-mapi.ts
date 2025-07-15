import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { snippetElementSchema } from "../schemas/contentTypeSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-content-type-snippet-mapi",
    "Add new Kontent.ai content type snippet via Management API",
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

      try {
        const response = await client
          .addContentTypeSnippet()
          .withData(() => ({
            name,
            codename,
            external_id,
            elements,
          }))
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Content Type Snippet Creation");
      }
    },
  );
};
