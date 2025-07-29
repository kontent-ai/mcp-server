import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { languageVariantElementSchema } from "../schemas/contentItemSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "upsert-language-variant-mapi",
    "Create or update Kontent.ai language variant of a content item via Management API. This adds actual content to the content item elements. When updating an existing variant, only the provided elements will be modified.",
    {
      itemId: z.string().describe("Internal ID of the content item"),
      languageId: z
        .string()
        .describe(
          "Internal ID of the language variant (e.g., '00000000-0000-0000-0000-000000000000' for default language)",
        ),
      elements: z
        .array(languageVariantElementSchema)
        .describe(
          "Array of content elements, each with 'element' (reference object with id/codename/external_id) and 'value' properties. Additional properties may be required depending on element type (e.g., 'mode' for URL slugs).",
        ),
      workflow_step_id: z
        .string()
        .optional()
        .describe("Internal ID of the workflow step (optional)"),
    },
    async ({ itemId, languageId, elements, workflow_step_id }) => {
      const client = createMapiClient();

      const data: any = {
        elements,
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
