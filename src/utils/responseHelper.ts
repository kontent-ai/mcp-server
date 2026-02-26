/**
 * Utility for creating standardized MCP tool success responses.
 * Passes API data through to MCP response format without transformation.
 */

export interface McpToolSuccessResponse {
  [x: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: false;
}

/**
 * Converts data to MCP tool success response format.
 * Handles undefined separately as JSON.stringify(undefined) returns undefined (not a string).
 * Skips stringify for strings as they don't need JSON encoding for MCP text response.
 */
export const createMcpToolSuccessResponse = (
  data: any,
): McpToolSuccessResponse => {
  const text =
    data === undefined
      ? "undefined"
      : typeof data === "string"
        ? data
        : JSON.stringify(data);

  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
};
