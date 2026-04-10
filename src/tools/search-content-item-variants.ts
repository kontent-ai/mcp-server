import pRetry, { AbortError } from "p-retry";
import { createMapiClient } from "../clients/kontentClients.js";
import { searchOperationSchema } from "../schemas/searchOperationSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";
import {
  bulkGetContentItemVariantsToolName,
  listContentItemVariantsToolName,
  searchContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineTool } from "./toolDefinition.js";

interface AiOperationResponse {
  operationId: string;
}

interface AiOperationResultResponse {
  type: string;
  result?: AiOperationResult;
}

interface AiOperationResult {
  isFinished: boolean;
  value?: string;
}

class OperationResultIncompleteError extends Error {
  constructor() {
    super("AI operation result is incomplete");
    this.name = "OperationResultIncompleteError";
  }
}

const isSearchResponseWrapper = (
  value: unknown,
): value is { searchResults: string } =>
  typeof value === "object" && value !== null && "searchResults" in value;

const extractSearchResults = (response: AiOperationResultResponse): object => {
  const value = response.result?.value;
  if (!value) {
    return {};
  }

  const parsed = JSON.parse(value);
  if (isSearchResponseWrapper(parsed)) {
    return JSON.parse(parsed.searchResults);
  }

  return parsed;
};

export const searchContentItemVariants = defineTool(
  searchContentItemVariantsToolName,
  `AI semantic search for Kontent.ai content items with item variants (language versions/translations) by topic, theme, or meaning. Find content by natural language query. Returns only top 50 results. This feature may be unavailable. Use ${listContentItemVariantsToolName} for full content inventory filtering or exact keyword matching. Use ${bulkGetContentItemVariantsToolName} to retrieve full content of the variants.`,
  searchOperationSchema.shape,
  async ({ searchPhrase, filter }, { authInfo: { token, clientId } = {} }) => {
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

      const searchResults = extractSearchResults(resultData);

      return createMcpToolSuccessResponse({
        result: searchResults,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "AI-powered Variant Search");
    }
  },
);
