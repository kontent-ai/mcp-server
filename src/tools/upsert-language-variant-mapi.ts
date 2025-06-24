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
      itemCodename: z.string().describe("Codename of the content item"),
      languageCodename: z
        .string()
        .describe(
          "Codename of the language variant (e.g., 'default', 'en-US', 'es-ES')",
        ),
      elements: z
        .string()
        .describe(
          'JSON string representing an array of element objects. Each element should have an "element" object with "codename" property and a "value" property. Example: \'[{"element": {"codename": "title"}, "value": "My Title"}, {"element": {"codename": "content"}, "value": "<p>My content</p>"}]\'',
        ),
      workflow_step_codename: z
        .string()
        .optional()
        .describe("Codename of the workflow step (optional)"),
    },
    async ({
      itemCodename,
      languageCodename,
      elements,
      workflow_step_codename,
    }) => {
      const client = createMapiClient();

      let parsedElements: any;
      try {
        parsedElements = JSON.parse(elements);
      } catch (error) {
        return createValidationErrorResponse(
          `Invalid JSON format in elements parameter. ${error instanceof Error ? error.message : "Unknown JSON parsing error"}`,
          "JSON Parsing Error",
        );
      }

      const data: any = {
        elements: parsedElements,
      };

      if (workflow_step_codename) {
        data.workflow_step = { codename: workflow_step_codename };
      }

      try {
        const response = await client
          .upsertLanguageVariant()
          .byItemCodename(itemCodename)
          .byLanguageCodename(languageCodename)
          .withData(() => data)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Language Variant Upsert");
      }
    },
  );
};
