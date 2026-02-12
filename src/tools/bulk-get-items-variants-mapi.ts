import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { bulkGetItemsWithVariantsSchema } from "../schemas/bulkGetItemsWithVariantsSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createVariantMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "bulk-get-items-variants-mapi",
    "Bulk get Kontent.ai content items with their language variants by item and language reference pairs. Items without a variant in the requested language return the item without the variant property.",
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

        return createVariantMcpToolSuccessResponse({
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
};
