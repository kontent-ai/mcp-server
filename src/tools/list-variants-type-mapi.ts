import { createMapiClient } from "../clients/kontentClients.js";
import { listVariantsTypeSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listVariantsTypeMapi = createTool(
  ...defineTool(
    "list-variants-type-mapi",
    "List Kontent.ai language variants by content type from Management API (paginated)",
    listVariantsTypeSchema.shape,
    async (
      { contentTypeId, continuation_token },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client
          .listLanguageVariantsOfContentType()
          .byTypeId(contentTypeId);

        const response = await (continuation_token
          ? query.xContinuationToken(continuation_token)
          : query
        ).toPromise();

        return createMcpToolSuccessResponse({
          variants: response.rawData.variants,
          pagination: {
            continuation_token: response.data.pagination.continuationToken,
          },
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Content Type Variants Listing");
      }
    },
  ),
);
