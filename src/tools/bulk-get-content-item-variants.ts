import { createMapiClient } from "../clients/kontentClients.js";
import { bulkGetItemsWithVariantsSchema } from "../schemas/bulkGetItemsWithVariantsSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";
import { bulkGetContentItemVariantsToolName } from "./referencedToolNames.js";
import { defineTool } from "./toolDefinition.js";

export const bulkGetContentItemVariants = defineTool(
  bulkGetContentItemVariantsToolName,
  "Bulk/batch retrieve multiple Kontent.ai content items with their item variants (language versions/translations) by item and language reference pairs. Fetch full content for item and variant IDs found via other tools.",
  bulkGetItemsWithVariantsSchema.shape,
  async (
    { variants, continuation_token },
    { authInfo: { token, clientId } = {} },
  ) => {
    try {
      const environmentId = clientId ?? process.env.KONTENT_ENVIRONMENT_ID;
      if (!environmentId) {
        throwError("Missing required environment ID");
      }

      const client = createMapiClient(environmentId, token);

      const query = client.bulkGetItemsWithVariants().withData({
        variants,
      });

      const response = await (continuation_token
        ? query.xContinuationToken(continuation_token)
        : query
      ).toPromise();

      return createMcpToolSuccessResponse({
        data: response.rawData.data,
        pagination: {
          continuation_token: response.data.pagination.continuationToken,
        },
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Bulk Get Items With Variants");
    }
  },
);
