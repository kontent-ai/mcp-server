import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { coerceJsonString } from "../schemas/coerceJsonString.js";
import { snippetElementSchema } from "../schemas/contentTypeAndSnippetSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createContentTypeSnippet = defineAdditiveTool(
  "create-content-type-snippet",
  "Build a new Kontent.ai content type snippet from scratch — a reusable set of elements you can include in multiple content types. Use this to add a snippet that does not yet exist.",
  {
    name: z.string().describe("Snippet name"),
    codename: z
      .string()
      .optional()
      .describe("Codename (auto-generated if omitted)"),
    external_id: z.string().optional().describe("External ID"),
    elements: coerceJsonString(
      z.array(snippetElementSchema).describe("Elements defining structure"),
    ),
  },
  async (
    { name, codename, external_id, elements },
    { authInfo: { token, clientId } = {} },
  ) => {
    const client = createMapiClient(clientId, token);

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
