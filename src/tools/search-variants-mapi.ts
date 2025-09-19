import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import pRetry, { AbortError } from "p-retry";
import { createMapiClient } from "../clients/kontentClients.js";
import { searchOperationSchema } from "../schemas/searchOperationSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";

interface AiOperationResponse {
  operationId: string;
}

export const registerTool = (server: McpServer): void => {
  server.tool(
    "search-variants-mapi",
    `AI-powered semantic search for finding Kontent.ai content by meaning, concepts, themes, and content similarity in a specific language variant. This tool uses vector database and AI to enable searching by meaning and similarity rather than exact keyword matching.
    
    CRITICAL REQUIREMENTS:
    - The AI search feature may not be available for all Kontent.ai environments
    - If you receive an "unavailable" status response, DO NOT attempt to use this tool again in the same session
    - Use filter-variants-mapi for exact text matching when semantic search is unavailable
    - Requires language variant filter parameter (e.g., default language '00000000-0000-0000-0000-000000000000')
    - The tool always RETURNS ONLY TOP 50 most relevant items at max
    - Limited filtering options (only by variant ID) - use filter-variants-mapi for advanced filtering by content types, workflow steps, taxonomies, etc.
    
    USE FOR:
    - Conceptual search: NEVER extract keywords, pass the single concept/theme as-is (e.g., "find content about keeping beverages cold" → searchPhrase: "beverage coolers")
    - Finding content about topics: Use topic as-is (e.g., "find fairy tales" → searchPhrase: "fairy tales")
    - Content similarity: Find articles similar to a given topic or story theme (e.g. "<<larger piece of content to search similar items>>" -> searchPhrase: "<<larger piece of content to search similar items>>")
    - Thematic content discovery based on meaning and context`,
    searchOperationSchema.shape,
    async (
      { searchPhrase, filter },
      { authInfo: { token, clientId } = {} },
    ) => {
      try {
        const environmentId = clientId ?? process.env.KONTENT_ENVIRONMENT_ID;
        if (!environmentId) {
          throwError("Missing required environment ID");
        }

        const client = createMapiClient(environmentId, token);

        // Step 1: Initiate the AI search operation
        const searchPayload = {
          actionName: "Search",
          type: "multiple-inputs-request-v1",
          inputs: {
            searchPhrase: {
              type: "string",
              value: searchPhrase,
            },
            filter: {
              type: "content-item-variant-filter",
              value: filter,
            },
          },
          trackingData: {
            type: "empty-operation-tracking-data-v1",
          },
        };

        let searchResponse: any;
        try {
          searchResponse = await client
            .post()
            .withAction(`projects/${environmentId}/early-access/ai-operation`)
            .withData(searchPayload)
            .toPromise();
        } catch (error: any) {
          if (
            error?.response?.status === 403 &&
            error?.response?.data?.message?.includes("AI Feature Not Available")
          ) {
            return createMcpToolSuccessResponse({
              status: "unavailable",
              result: `AI search feature is not available for environment ${clientId}`,
            });
          }
          throw error;
        }

        const operationData: AiOperationResponse = searchResponse.data;
        const operationId = operationData.operationId;

        // Step 2: Poll for results with exponential backoff
        const resultData = await pRetry(
          async () => {
            try {
              const pollResponse = await client
                .get()
                .withAction(
                  `projects/${environmentId}/early-access/ai-operation-result/${operationId}`,
                )
                .toPromise();

              return pollResponse.data;
            } catch (error: any) {
              if (error?.response?.status === 404) {
                throw new Error(
                  "Operation result not available yet. Retrying.",
                );
              }
              throw new AbortError(error);
            }
          },
          {
            // Worst-case retry time: ~1 minute
            retries: 10,
            minTimeout: 1000,
            maxTimeout: 10000,
            factor: 1.5,
          },
        );

        return createMcpToolSuccessResponse({
          result: resultData,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "AI-powered Variant Search");
      }
    },
  );
};
