/**
 * Utility for creating standardized MCP tool success responses
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
 * Creates a standardized MCP tool success response
 * @param data The data to include in the response
 * @returns Standardized MCP tool success response
 */
export const createMcpToolSuccessResponse = (
  data: any,
): McpToolSuccessResponse => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
};
