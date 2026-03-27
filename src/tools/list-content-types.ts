import { createMapiClient } from "../clients/kontentClients.js";
import { listContentTypesSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const listContentTypes = defineTool(
  "list-content-types",
  "List all Kontent.ai content types (paginated). Retrieve every content type (schema/model) definition. Get an overview of all content type models, their elements, field validation rules, and content groups.",
  listContentTypesSchema.shape,
  async ({ continuation_token }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const query = client.listContentTypes();

      const response = await (continuation_token
        ? query.xContinuationToken(continuation_token)
        : query
      ).toPromise();

      return createMcpToolSuccessResponse({
        data: response.rawData.types,
        pagination: {
          continuation_token: response.data.pagination.continuationToken,
        },
      });
    } catch (error: any) {
      return handleMcpToolError(error, "Content Types Listing");
    }
  },
);
