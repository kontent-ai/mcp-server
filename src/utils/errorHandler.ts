/**
 * Utility for handling errors in MCP tools and returning standardized error responses
 */

import type { McpToolSuccessResponse } from "./responseHelper.js";

export interface McpToolErrorResponse {
  [x: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError: true;
}

export type McpToolResponse = McpToolErrorResponse | McpToolSuccessResponse;

/**
 * Handles various types of errors and returns a standardized MCP tool error response
 * @param error The error to handle
 * @param context Optional context string to include in error message
 * @returns Standardized MCP tool error response
 */
export const handleMcpToolError = (
  error: any,
  context?: string,
): McpToolErrorResponse => {
  const contextPrefix = context ? `${context}: ` : "";

  // Handle Kontent.ai Management API specific errors
  if (error?.name === "ContentManagementBaseKontentError" || error?.requestId) {
    const errorMessage = [
      `${contextPrefix}Kontent.ai Management API Error:`,
      `Message: ${error.message || "Unknown API error"}`,
      error.errorCode ? `Error Code: ${error.errorCode}` : null,
      error.requestId ? `Request ID: ${error.requestId}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Include validation errors if available
    if (error.validationErrors && Array.isArray(error.validationErrors)) {
      const validationDetails = error.validationErrors
        .map((ve: any) => `- ${ve.message || JSON.stringify(ve)}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `${errorMessage}\n\nValidation Errors:\n${validationDetails}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: errorMessage,
        },
      ],
      isError: true,
    };
  }

  // Handle network or other HTTP errors
  if (error?.response) {
    return {
      content: [
        {
          type: "text",
          text: `${contextPrefix}HTTP Error ${error.response.status}: ${error.response.statusText || "Unknown HTTP error"}\n\nResponse: ${JSON.stringify(error.response.data)}`,
        },
      ],
      isError: true,
    };
  }

  // Handle generic errors
  return {
    content: [
      {
        type: "text",
        text: `${contextPrefix}Unexpected error: ${error instanceof Error ? error.message : "Unknown error occurred"}\n\nFull error: ${JSON.stringify(error)}`,
      },
    ],
    isError: true,
  };
};

/**
 * Creates a standardized MCP tool error response for validation errors
 * @param message The validation error message
 * @param context Optional context string
 * @returns Standardized MCP tool error response
 */
export const createValidationErrorResponse = (
  message: string,
  context?: string,
): McpToolErrorResponse => {
  const contextPrefix = context ? `${context}: ` : "";

  return {
    content: [
      {
        type: "text",
        text: `${contextPrefix}${message}`,
      },
    ],
    isError: true,
  };
};
