import { createMapiClient } from "../clients/kontentClients.js";
import { listVariantsComponentsTypeSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listVariantsComponentsType = createTool(
  ...defineTool(
    "list-variants-components-type",
    "List Kontent.ai language variants containing inline components of a specific content type (paginated). Find content that embeds reusable components of a given type.",
    listVariantsComponentsTypeSchema.shape,
    async (
      { contentTypeId, continuation_token },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client
          .listLanguageVariantsOfContentTypeWithComponents()
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
        return handleMcpToolError(
          error,
          "Content Type Variants With Components Listing",
        );
      }
    },
  ),
);
