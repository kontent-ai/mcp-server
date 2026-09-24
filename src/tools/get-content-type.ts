import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getContentType = defineReadOnlyTool(
  "get-content-type",
  "Retrieve (fetch) a single Kontent.ai content type by ID — its schema/model definition. Content types define the structure (elements/fields) of content item variants or structure of content components inside rich text elements, validation rules, and content groups.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Content type ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.viewContentType().byTypeId(id).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Content Type Retrieval");
    }
  },
);
