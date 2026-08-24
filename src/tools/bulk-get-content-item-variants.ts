import {
  agentMetadataHeader,
  createMapiClient,
} from "../clients/kontentClients.js";
import { bulkGetItemsWithVariantsSchema } from "../schemas/bulkGetItemsWithVariantsSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";
import { bulkGetContentItemVariantsToolName } from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const bulkGetContentItemVariants = defineReadOnlyTool(
  bulkGetContentItemVariantsToolName,
  "Bulk/batch retrieve full details and content for multiple (2 or more) Kontent.ai content item variants by item and language reference pairs. Fetch full content for several items whose IDs were found via other tools.",
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

      const query = client
        .bulkGetItemsWithVariants()
        .withData({
          variants,
        })
        .withHeader(agentMetadataHeader);

      const response = await (continuation_token
        ? query.xContinuationToken(continuation_token)
        : query
      ).toPromise();

      // The MAPI omits the variant property entirely when an item has no
      // variant in the requested language, and an agent reads that absence as
      // "unknown" rather than "does not exist", then re-fetches item by item.
      const data = response.rawData.data.map((entry) => ({
        variant_exists: Boolean(entry.variant),
        ...entry,
      }));

      return createMcpToolSuccessResponse({
        data,
        pagination: {
          continuation_token: response.data.pagination.continuationToken,
        },
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Bulk Get Items With Variants");
    }
  },
);
