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

interface AiOperationResultResponse {
  type: string;
  result?: AiOperationResult;
}

interface AiOperationResult {
  isFinished: boolean;
}

class OperationResultIncompleteError extends Error {
  constructor() {
    super("AI operation result is incomplete");
    this.name = "OperationResultIncompleteError";
  }
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
    - Finding content WHERE THE OVERALL TOPIC/THEME matches a concept
      ✓ Example: "fairy tales" → finds articles primarily about fairy tales
      ✓ Example: "beverage temperature control" → finds content focused on keeping drinks cold/hot
    - Content similarity: Finding articles with similar overall themes
    - Thematic content discovery when the main subject matter is what you're looking for

    DO NOT USE FOR:
    - Finding specific words scattered in otherwise unrelated content
      ✗ Example: Finding "challenge" term in articles about various topics (use filter-variants-mapi)
    - Brand guideline violations or prohibited term detection (use filter-variants-mapi)
    - Compliance audits looking for specific keywords (use filter-variants-mapi)
    - Finding exhaustive and exact number of results (use filter-variants-mapi)

    CRITICAL: This is SEMANTIC search for topic matching. Pass natural language concepts AS-IS. DO NOT generate keyword lists or concatenate multiple keywords.
    ✓ CORRECT: "animal predators" or "articles about temperature control"
    ✗ WRONG: "animal beast creature wild hunt predator prey attack"`,
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

              const [response]: AiOperationResultResponse[] = pollResponse.data;

              if (
                response.type === "cumulated-result-v1" &&
                !response.result?.isFinished
              ) {
                throw new OperationResultIncompleteError();
              }

              return response;
            } catch (error: any) {
              if (
                error?.response?.status === 404 ||
                error instanceof OperationResultIncompleteError
              ) {
                throw error;
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
