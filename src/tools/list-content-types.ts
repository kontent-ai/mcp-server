import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { listContentTypesSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listContentTypes = defineReadOnlyTool(
  "list-content-types",
  "List all Kontent.ai content types (paginated). Retrieve every content type (schema/model) definition. Get an overview of all content type models, which define the structure of content item variants and of content components inside rich text elements.",
  { environmentId: environmentIdSchema, ...listContentTypesSchema.shape },
  async (
    { environmentId, continuation_token },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

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
