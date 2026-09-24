import pRetry, { AbortError } from "p-retry";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { searchOperationSchema } from "../schemas/searchOperationSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  listContentItemVariantsToolName,
  searchContentItemVariantsToolName,
} from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

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

export const searchContentItemVariants = defineReadOnlyTool(
  searchContentItemVariantsToolName,
  `AI semantic search for Kontent.ai content items with content item variants (language versions/translations) by topic, theme, or meaning. Use when you know what content is *about* — not when looking for an item by name or title; use ${listContentItemVariantsToolName} for that. Returns lightweight references, top 50 results max. This feature may be unavailable.`,
  { environmentId: environmentIdSchema, ...searchOperationSchema.shape },
  async (
    { environmentId: rawEnvironmentId, searchPhrase, filter },
    { authInfo: { token } = {} },
  ) => {
    try {
      const client = createMapiClient(rawEnvironmentId, token);
      // createMapiClient already throws when neither environmentId nor
      // KONTENT_ENVIRONMENT_ID is set, so by this point one of them is defined —
      // resolve it again here since the action URLs below need the string itself.
      const environmentId = (rawEnvironmentId ??
        process.env.KONTENT_ENVIRONMENT_ID) as string;

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
            result: `AI search feature is not available for environment ${environmentId}. Do not retry this tool. Use ${listContentItemVariantsToolName} instead (its search_phrase parameter supports exact keyword matching).`,
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
