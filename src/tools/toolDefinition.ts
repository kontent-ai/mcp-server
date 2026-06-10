import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

export type ToolDefinition<Args extends ZodRawShapeCompat = ZodRawShapeCompat> =
  {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Args;
    readonly handler: ToolCallback<Args>;
    readonly annotations: ToolAnnotations;
  };

/**
 * Defines a tool that does not modify the environment (get, list, search).
 * Compliant MCP clients may run read-only tools without a confirmation prompt.
 */
export const defineReadOnlyTool = <Args extends ZodRawShapeCompat>(
  name: string,
  description: string,
  inputSchema: Args,
  handler: ToolCallback<Args>,
): ToolDefinition<Args> => ({
  name,
  description,
  inputSchema,
  handler,
  // openWorldHint: false — every tool operates on the configured Kontent.ai
  // environment only (a closed domain).
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
});

/**
 * Defines a tool that only adds to the environment — it creates new entities
 * and never overwrites or removes existing ones (e.g. create-content-type).
 * Marked `destructiveHint: false` so compliant clients can treat it as
 * lower-risk than a destructive tool while still recognising it as a mutation.
 */
export const defineAdditiveTool = <Args extends ZodRawShapeCompat>(
  name: string,
  description: string,
  inputSchema: Args,
  handler: ToolCallback<Args>,
): ToolDefinition<Args> => ({
  name,
  description,
  inputSchema,
  handler,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    openWorldHint: false,
  },
});

/**
 * Defines a tool that may overwrite or remove existing data (update, patch,
 * delete, publish, unpublish, upsert). Compliant MCP clients surface their own
 * confirmation step before running a destructive tool.
 */
export const defineDestructiveTool = <Args extends ZodRawShapeCompat>(
  name: string,
  description: string,
  inputSchema: Args,
  handler: ToolCallback<Args>,
): ToolDefinition<Args> => ({
  name,
  description,
  inputSchema,
  handler,
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: false,
  },
});
