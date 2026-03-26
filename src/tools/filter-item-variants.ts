import { createMapiClient } from "../clients/kontentClients.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const filterItemVariants = createTool(
  ...defineTool(
    "filter-item-variants",
    "Filter and find Kontent.ai content items with item variants (language versions/translations) returning references (item ID + language ID). For EXACT keyword matching and compliance filtering (terms use OR). Use bulk-get-item-variants to retrieve full content. Use search-item-variants for semantic/topic search.",
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
  ),
);
