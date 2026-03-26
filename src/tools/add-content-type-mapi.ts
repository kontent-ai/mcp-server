import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import {
  contentGroupSchema,
  elementSchema,
} from "../schemas/contentTypeAndSnippetSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const addContentTypeMapi = createTool(
  ...defineTool(
    "add-content-type-mapi",
    "Create new Kontent.ai content type (schema/model). Define content structure with elements, validation rules, and content groups.",
    {
      name: z.string().describe("Content type name"),
      codename: z
        .string()
        .optional()
        .describe("Codename (auto-generated if omitted)"),
      external_id: z.string().optional().describe("External ID"),
      elements: z.array(elementSchema).describe("Elements defining structure"),
      content_groups: z
        .array(contentGroupSchema)
        .optional()
        .describe("Content groups"),
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
  ),
);
