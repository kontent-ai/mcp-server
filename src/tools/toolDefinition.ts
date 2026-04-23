import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";

export type ToolDefinition<Args extends ZodRawShapeCompat = ZodRawShapeCompat> =
  {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Args;
    readonly handler: ToolCallback<Args>;
  };

export const defineTool = <Args extends ZodRawShapeCompat>(
  name: string,
  description: string,
  inputSchema: Args,
  handler: ToolCallback<Args>,
): ToolDefinition<Args> => ({ name, description, inputSchema, handler });
