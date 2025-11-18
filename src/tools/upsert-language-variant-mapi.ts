import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { languageVariantElementSchema } from "../schemas/contentItemSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "upsert-language-variant-mapi",
    "Create or update Kontent.ai variant",
    {
      itemId: z.string().describe("Content item ID"),
      languageId: z
        .string()
        .describe(
          "Language variant ID (default: 00000000-0000-0000-0000-000000000000)",
        ),
      elements: z
        .array(languageVariantElementSchema)
        .describe("Content elements array"),
      workflow_step_id: z.string().optional().describe("Workflow step ID"),
    },
    async (
      { itemId, languageId, elements, workflow_step_id },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

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
