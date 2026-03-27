import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";

export type ToolDefinition<Args extends ZodRawShapeCompat = ZodRawShapeCompat> =
  {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Args;
    readonly handler: ToolCallback<Args>;
  };

/** Identity wrapper — use `createTool(...defineTool(...))` to preserve 4-space indentation after formatting. */
export const defineTool = <Args extends ZodRawShapeCompat>(
  ...args: [string, string, Args, ToolCallback<Args>]
): [string, string, Args, ToolCallback<Args>] => args;

export const createTool = <Args extends ZodRawShapeCompat>(
  ...[name, description, inputSchema, handler]: [
    string,
    string,
    Args,
    ToolCallback<Args>,
  ]
): ToolDefinition<Args> => ({ name, description, inputSchema, handler });
