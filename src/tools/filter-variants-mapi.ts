import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "filter-variants-mapi",
    `Filter Kontent.ai language variants of content items using Management API.

    USE FOR:
    - EXACT keyword matching: finding specific words, phrases, names, codes, or IDs in content. Example: 'find items containing rabbit' → search 'rabbit'
    - Advanced filtering by content type, contributors, workflow steps, taxonomies etc
    - CAN expand concepts to keywords when using filter (e.g., "neurology-related" → "neurology neurological brain nervous system")
    - Also use as fallback when AI search is unavailable
    - Supports pagination with continuation_token
    - Optionally includes full content of variants with include_content parameter`,
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
        order_by,
        order_direction,
        include_content,
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

        const query = client.earlyAccess.filterLanguageVariants().withData({
          filters: {
            search_phrase,
            content_types,
            contributors,
            has_no_contributors,
            completion_statuses,
            language,
            workflow_steps,
            taxonomy_groups,
          },
          order: order_by
            ? {
                by: order_by,
                direction: order_direction || "asc",
              }
            : undefined,
          include_content: include_content ?? false,
        });

        if (continuation_token) {
          query.withHeaders([
            { header: "X-Continuation", value: continuation_token },
          ]);
        }

        const response = await query.toPromise();

        // Return the raw data from the response
        // The continuation token should be included in the rawData if present
        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Variant Filter");
      }
    },
  );
};
