import { resolveCredentials } from "../clients/credentials.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  listContentItemVariantsToolName,
  searchContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

const continuationTokenHeader = "x-continuation";

const searchAction = (environmentId: string) =>
  `projects/${environmentId}/early-access/search/variants`;

type VariantQueryResult = {
  readonly id: {
    readonly item_id: string;
    readonly variant_id: string;
  };
};

type VariantQueryResponse = {
  readonly data: ReadonlyArray<VariantQueryResult>;
  readonly pagination: {
    readonly continuation_token: string | null;
  };
};

// The shape bulk-get-content-item-variants takes as its input, so a caller can hand the references
// straight to it.
const toVariantReferences = (response: VariantQueryResponse) =>
  response.data.map(({ id }) => ({
    item: { id: id.item_id },
    language: { id: id.variant_id },
  }));

export const listContentItemVariants = defineReadOnlyTool(
  listContentItemVariantsToolName,
  `List, find, filter Kontent.ai content items with content item variants (language versions/translations), returning lightweight item ID + language ID references for further lookup. Filter by content item content type, collection, space, workflow step, taxonomy, or publishing state. Search items and variants by keywords, matched against both their names and their content. Use ${searchContentItemVariantsToolName} when you know what content is *about* (topic, theme) rather than its name or identity. Results come from a search index that is built asynchronously, so a change made moments ago may be missing from them.`,
  filterVariantsSchema.shape,
  async (
    {
      search_phrase,
      content_types,
      contributors,
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
    const { environmentId, apiKey } = resolveCredentials(clientId, token);
    const client = createMapiClient(environmentId, apiKey);

    try {
      const query = client
        .post()
        .withAction(searchAction(environmentId))
        .withData({
          filters: {
            keywords: search_phrase && { expression: search_phrase },
            content_types,
            contributors: contributors && { values: contributors },
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
        ? query.withHeader({
            header: continuationTokenHeader,
            value: continuation_token,
          })
        : query
      ).toPromise();

      const responseData: VariantQueryResponse = response.data;

      return createMcpToolSuccessResponse({
        variants: toVariantReferences(responseData),
        pagination: {
          continuation_token: responseData.pagination.continuation_token,
        },
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "List Content Item Variants");
    }
  },
);
