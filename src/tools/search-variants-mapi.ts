import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { searchOperationSchema } from "../schemas/searchOperationSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";

interface AiOperationResponse {
  operationId: string;
}

interface AiOperationResultResponse {
  message: string;
  operationId: string;
  result?: any;
}

interface HttpError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
}

// Session-level flag to track AI feature availability
let aiFeatureAvailable = true;

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "search-variants-mapi",
    `AI-powered semantic search for finding Kontent.ai content by meaning, concepts, and themes in a specific language variant. This tool uses vector database and AI to enable searching by meaning and similarity rather than exact keyword matching. Use for: conceptual searches (romance, technical, beginner-friendly), finding content about topics (animals, technology, health), discovering related content, searching when you don't know exact keywords. 
    
    CRITICAL REQUIREMENTS:
    - The AI search feature may not be available for all Kontent.ai projects
    - If you receive an "unavailable" status response, DO NOT attempt to use this tool again in the same session
    - Use filter-variants-mapi for exact text matching when semantic search is unavailable
    - Requires language variant filter parameter (e.g., default language '00000000-0000-0000-0000-000000000000')`,
    searchOperationSchema.shape,
    async (
      { actionName, type, inputs, trackingData },
      { authInfo: { token, clientId } = {} },
    ) => {
      try {
        const AI_SEARCH_UNAVAILABLE_RESPONSE = {
          status: "unavailable",
          message: "AI search feature is not available for this environment",
          reason:
            "This Kontent.ai project does not have the AI search feature enabled",
        } as const;

        // Check if AI feature is available from previous calls
        if (!aiFeatureAvailable) {
          return createMcpToolSuccessResponse(AI_SEARCH_UNAVAILABLE_RESPONSE);
        }

        const environmentId = clientId ?? process.env.KONTENT_ENVIRONMENT_ID;
        if (!environmentId) {
          throwError("Missing required environment ID");
        }

        const apiKey = token ?? process.env.KONTENT_API_KEY;
        if (!apiKey) {
          throwError("Missing required API key");
        }

        const baseUrl = config
          ? `${config.manageApiUrl}`
          : `https://manage.kontent.ai/`;

        // Step 1: Initiate the AI search operation
        const searchUrl = `${baseUrl}v2/projects/${environmentId}/early-access/ai-operation`;

        const searchPayload = {
          actionName,
          type,
          inputs,
          trackingData,
        };

        const searchHeaders: Record<string, string> = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };

        const searchResponse = await fetch(searchUrl, {
          method: "POST",
          headers: searchHeaders,
          body: JSON.stringify(searchPayload),
        });

        if (!searchResponse.ok) {
          const responseText = await searchResponse.text();
          let responseData: any;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          if (
            searchResponse.status === 403 &&
            responseData?.message?.includes("AI Feature Not Available")
          ) {
            aiFeatureAvailable = false;
            return createMcpToolSuccessResponse(AI_SEARCH_UNAVAILABLE_RESPONSE);
          }

          const error: HttpError = new Error(
            `HTTP error! status: ${searchResponse.status}`,
          );
          error.response = {
            status: searchResponse.status,
            statusText: searchResponse.statusText,
            data: responseData,
          };
          throw error;
        }

        const operationData: AiOperationResponse = await searchResponse.json();
        const operationId = operationData.operationId;

        // Step 2: Poll for results with exponential backoff
        const pollUrl = `${baseUrl}v2/projects/${environmentId}/early-access/ai-operation/${operationId}`;
        const pollHeaders: Record<string, string> = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };

        let maxRetries = 10; // Maximum number of polling attempts
        let retryDelay = 1000; // Initial delay in milliseconds
        const maxDelay = 10000; // Maximum delay between retries

        while (maxRetries > 0) {
          const pollResponse = await fetch(pollUrl, {
            method: "GET",
            headers: pollHeaders,
          });

          if (!pollResponse.ok) {
            const responseText = await pollResponse.text();
            let responseData: any;
            try {
              responseData = JSON.parse(responseText);
            } catch {
              responseData = responseText;
            }

            const error: HttpError = new Error(
              `HTTP error! status: ${pollResponse.status}`,
            );
            error.response = {
              status: pollResponse.status,
              statusText: pollResponse.statusText,
              data: responseData,
            };
            throw error;
          }

          const resultData: AiOperationResultResponse =
            await pollResponse.json();

          // Check the operation state based on the message patterns
          if (resultData.message.includes("still in progress")) {
            // Operation is still pending, continue polling
            maxRetries--;
            if (maxRetries === 0) {
              throwError(
                `Search operation timed out after maximum polling attempts. Operation ID: ${operationId}`,
              );
            }

            // Wait before next poll with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retryDelay = Math.min(retryDelay * 1.5, maxDelay);
            continue;
          }

          if (resultData.message.includes("completed successfully")) {
            return createMcpToolSuccessResponse({
              status: "completed",
              message: resultData.message,
              operationId: operationId,
              result: resultData.result,
            });
          }

          if (resultData.message.includes("cancelled")) {
            return createMcpToolSuccessResponse({
              status: "cancelled",
              message: resultData.message,
              operationId: operationId,
            });
          }

          // Handle failed or unexpected states
          throwError(
            `Search operation error: ${resultData.message}. Operation ID: ${operationId}`,
          );
        }

        // This shouldn't be reached, but included for completeness
        throw new Error(
          `Search operation polling exhausted all retries. Operation ID: ${operationId}`,
        );
      } catch (error: unknown) {
        return handleMcpToolError(error, "AI-powered Variant Search");
      }
    },
  );
};
