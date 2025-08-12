import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import {
  contentGroupSchema,
  elementSchema,
} from "../schemas/contentTypeSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-content-type-mapi",
    "Add new Kontent.ai content type via Management API",
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
        .array(elementSchema)
        .describe(
          "Array of elements that define the structure of the content type",
        ),
      content_groups: z
        .array(contentGroupSchema)
        .optional()
        .describe("Array of content groups (optional)"),
    },
    async (
      { name, codename, external_id, elements, content_groups },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .addContentType()
          .withData(() => ({
            name,
            codename,
            external_id,
            elements,
            content_groups,
          }))
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Content Type Creation");
      }
    },
  );
};
