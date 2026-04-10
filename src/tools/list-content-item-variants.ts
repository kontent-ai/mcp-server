import { createMapiClient } from "../clients/kontentClients.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";
import {
  bulkGetContentItemVariantsToolName,
  listContentItemVariantsToolName,
  searchContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineTool } from "./toolDefinition.js";

export const listContentItemVariants = defineTool(
  listContentItemVariantsToolName,
  `List, filter, search Kontent.ai content items with item variants (language versions/translations) returning references (item ID + language ID). Filter by item content type, collection, space, workflow step, taxonomy, contained content component content type, or publishing state. Search items and variants by EXACT keyword matching (terms use OR). Use ${searchContentItemVariantsToolName} for semantic/topic search. Use ${bulkGetContentItemVariantsToolName} to retrieve full content of the item variants.`,
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
      component_types,
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
          component_types,
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
