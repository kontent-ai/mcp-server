import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getContentType = defineTool(
  "get-content-type",
  "Retrieve Kontent.ai content type (schema/model definition). Types define content structure: elements, field validation rules, and content groups.",
  {
    id: z.string().describe("Content type ID"),
  },
  async ({ id }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client.viewContentType().byTypeId(id).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Content Type Retrieval");
    }
  },
);
