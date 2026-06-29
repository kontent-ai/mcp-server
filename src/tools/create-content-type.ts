import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { coerceJsonString } from "../schemas/coerceJsonString.js";
import {
  contentGroupSchema,
  elementSchema,
} from "../schemas/contentTypeAndSnippetSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createContentType = defineAdditiveTool(
  "create-content-type",
  "Build a new Kontent.ai content type (schema/model) from scratch — define its elements, validation rules, and content groups. Use this to add a content type that does not yet exist.",
  {
    name: z.string().describe("Content type name"),
    codename: z
      .string()
      .optional()
      .describe("Codename (auto-generated if omitted)"),
    external_id: z.string().optional().describe("External ID"),
    elements: coerceJsonString(
      z.array(elementSchema).describe("Elements defining structure"),
    ),
    content_groups: coerceJsonString(
      z.array(contentGroupSchema).describe("Content groups"),
    ).optional(),
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
