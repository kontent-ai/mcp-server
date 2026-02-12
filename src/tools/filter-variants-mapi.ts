import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "filter-variants-mapi",
    "Filter Kontent.ai items with variants returning references (item ID + language ID). For EXACT keyword matching and compliance (terms use OR). Use bulk-get-items-variants-mapi to retrieve full content for matched items. Use search-variants-mapi for semantic/topic search.",
    filterVariantsSchema.shape,
    async (
      {
        search_phrase,
        content_types,
        contributors,
        has_no_contributors,
        completion_statuses,
        language,
        workflow_steps,
        taxonomy_groups,
        spaces,
        collections,
        publishing_states,
        order_by,
        order_direction,
        continuation_token,
      },
      { authInfo: { token, clientId } = {} },
    ) => {
      try {
        const environmentId = clientId ?? process.env.KONTENT_ENVIRONMENT_ID;
        if (!environmentId) {
          throwError("Missing required environment ID");
        }

        const client = createMapiClient(environmentId, token);

        const query = client.filterItemsWithVariants().withData({
          filters: {
            search_phrase,
            content_types,
            contributors,
            has_no_contributors,
            completion_statuses,
            language,
            workflow_steps,
            taxonomy_groups,
            spaces,
            collections,
            publishing_states,
          },
          order: order_by
            ? {
                by: order_by,
                direction: order_direction || "asc",
              }
            : undefined,
        });

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
        return handleMcpToolError(error, "Variant Filter");
      }
    },
  );
};
