import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import {
  createValidationErrorResponse,
  handleMcpToolError,
} from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "upsert-language-variant-mapi",
    "Create or update a language variant of a content item via Management API. This adds actual content to the content item elements. Elements should be provided as JSON string in the format expected by the SDK.",
    {
      itemId: z.string().describe("Internal ID of the content item"),
      languageId: z
        .string()
        .describe(
          "Internal ID of the language variant (e.g., '00000000-0000-0000-0000-000000000000' for default language)",
        ),
      elements: z
        .string()
        .describe(
          'JSON string representing an array of element objects. Each element should have an "element" object with "id" property and a "value" property. Example: \'[{"element": {"id": "title-element-id"}, "value": "My Title"}, {"element": {"id": "content-element-id"}, "value": "<p>My content</p>"}]\'',
        ),
      workflow_step_id: z
        .string()
        .optional()
        .describe("Internal ID of the workflow step (optional)"),
    },
    async ({ itemId, languageId, elements, workflow_step_id }) => {
      const client = createMapiClient();

      let parsedElements: any;
      try {
        parsedElements = JSON.parse(elements);
      } catch (error) {
        return createValidationErrorResponse(
          `Invalid JSON format in elements parameter. ${
            error instanceof Error
              ? error.message
              : "Unknown JSON parsing error"
          }`,
          "JSON Parsing Error",
        );
      }

      const data: any = {
        elements: parsedElements,
      };

      if (workflow_step_id) {
        data.workflow_step = { id: workflow_step_id };
      }

      try {
        const response = await client
          .upsertLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .withData(() => data)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Language Variant Upsert");
      }
    },
  );
};
