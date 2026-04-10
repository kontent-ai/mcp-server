import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { snippetElementSchema } from "../schemas/contentTypeAndSnippetSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const addContentTypeSnippet = defineTool(
  "add-content-type-snippet",
  "Create new Kontent.ai content type snippet. Snippets are reusable, shared sets of elements that can be included in multiple content types.",
  {
    name: z.string().describe("Snippet name"),
    codename: z
      .string()
      .optional()
      .describe("Codename (auto-generated if omitted)"),
    external_id: z.string().optional().describe("External ID"),
    elements: z
      .array(snippetElementSchema)
      .describe("Elements defining structure"),
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
