import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { languageVariantElementSchema } from "../schemas/contentItemSchemas.js";
import {
  createValidationErrorResponse,
  handleMcpToolError,
} from "../utils/errorHandler.js";
import { extractUserIdFromToken } from "../utils/extractUserIdFromToken.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  createContentItemVariantToolName,
  updateContentItemVariantToolName,
} from "./referencedToolNames.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createContentItemVariant = defineAdditiveTool(
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

    // The variant API is upsert-only, so calling this on an item+language that
    // already has a variant would overwrite its elements and reset its
    // contributors. Verify the variant does not exist yet; if it does, direct
    // the caller to the update tool.
    try {
      await client
        .viewLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(languageId)
        .toPromise();

      // The view succeeded, so a variant already exists.
      return createValidationErrorResponse(
        `A content item variant for item '${itemId}' in language '${languageId}' already exists. Use ${updateContentItemVariantToolName} to modify it.`,
        "Language Variant Create",
      );
    } catch (error: any) {
      // A 404 / "not found" is the expected, happy path — the variant does not
      // exist yet, so we can create it. Surface any other error (auth, etc.).
      if (
        error?.response?.status !== 404 &&
        !error?.message?.includes("not found")
      ) {
        return handleMcpToolError(error, "Language Variant Create");
      }
    }

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
