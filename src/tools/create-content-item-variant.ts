import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { languageVariantElementSchema } from "../schemas/contentItemSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { extractUserIdFromToken } from "../utils/extractUserIdFromToken.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createContentItemVariantToolName } from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const createContentItemVariant = defineDestructiveTool(
  createContentItemVariantToolName,
  "Create Kontent.ai content item variant — translate and localize content into a specific language. Adds a new language version (translation) for a content item. Send only the elements you want to set (omitted ones initialize with default value). Element values must fulfill the content type definition.",
  {
    itemId: z.string().describe("Content item ID"),
    languageId: z
      .string()
      .describe("Language ID (default: 00000000-0000-0000-0000-000000000000)"),
    elements: z
      .array(languageVariantElementSchema)
      .describe("Content elements array"),
    workflow_step_id: z.string().optional().describe("Workflow step ID"),
    note: z
      .string()
      .max(4000)
      .optional()
      .describe("Additional instructions or notes for content creators"),
  },
  async (
    { itemId, languageId, elements, workflow_step_id, note },
    { authInfo: { token, clientId } = {} },
  ) => {
    const client = createMapiClient(clientId, token);

    const data: any = {
      elements,
    };

    if (workflow_step_id) {
      data.workflow_step = { id: workflow_step_id };
    }

    if (note !== undefined) {
      data.note = note;
    }

    if (token) {
      const userId = extractUserIdFromToken(token);
      if (userId) {
        data.contributors = [{ id: userId }];
      }
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
      return handleMcpToolError(error, "Language Variant Create");
    }
  },
);
