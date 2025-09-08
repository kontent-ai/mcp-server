import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { filterVariantsSchema } from "../schemas/filterVariantSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "filter-variants-mapi",
    `Filter Kontent.ai language variants of content items using Management API.
    
    USE FOR:
    - EXACT keyword matching: finding specific words, phrases, names, codes, or IDs in content. Example: 'find items containing rabbit' → search 'rabbit'
    - Advanced filtering by content type, contributors, workflow steps, taxonomies etc
    - CAN expand concepts to keywords when using filter (e.g., "neurology-related" → "neurology neurological brain nervous system")
    - Also use as fallback when AI search is unavailable`,
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
        continuation_token,
      },
      { authInfo: { token, clientId } = {} },
    ) => {
      try {
        const requestPayload = {
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
                direction:
                  order_direction === "desc" ? "Descending" : "Ascending",
              }
            : null,
        };

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
        const url = `${baseUrl}v2/projects/${environmentId}/early-access/variants/filter`;

        const headers: Record<string, string> = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };
        if (continuation_token) {
          headers["X-Continuation"] = continuation_token;
        }

        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          const responseText = await response.text();
          let responseData: string;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          const error: HttpError = new Error(
            `HTTP error! status: ${response.status}`,
          );
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          };
          throw error;
        }

        const responseData = await response.json();

        return createMcpToolSuccessResponse(responseData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Variant Search");
      }
    },
  );
};

interface HttpError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
}
