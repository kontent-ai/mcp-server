import { createMapiClient } from "../clients/kontentClients.js";
import { listTaxonomyGroupsSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listTaxonomyGroups = createTool(
  ...defineTool(
    "list-taxonomy-groups",
    "List all Kontent.ai taxonomy groups (paginated). Taxonomy groups contain hierarchical tree-structured terms (categories/tags) that can be nested to any depth for content categorization and classification.",
    listTaxonomyGroupsSchema.shape,
    async ({ continuation_token }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const query = client.listTaxonomies();

        const response = await (continuation_token
          ? query.xContinuationToken(continuation_token)
          : query
        ).toPromise();

        return createMcpToolSuccessResponse({
          data: response.rawData.taxonomies,
          pagination: {
            continuation_token: response.data.pagination.continuationToken,
          },
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Groups Listing");
      }
    },
  ),
);
