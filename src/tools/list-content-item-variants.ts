import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  listContentItemVariantsToolName,
  searchContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listContentItemVariants = defineReadOnlyTool(
  listContentItemVariantsToolName,
  `List, find, filter Kontent.ai content items with content item variants (language versions/translations), returning lightweight item ID + language ID references for further lookup. Filter by content item content type, collection, space, workflow step, taxonomy, or publishing state. Search items and variants by keywords. Use ${searchContentItemVariantsToolName} when you know what content is *about* (topic, theme) rather than its name or identity.`,
  { environmentId: environmentIdSchema, ...filterVariantsSchema.shape },
  async (
    {
      environmentId,
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
    { authInfo: { token } = {} },
  ) => {
    try {
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
