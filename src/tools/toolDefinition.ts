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
  annotations: { readOnlyHint: true, openWorldHint: false },
});

/**
 * Defines a tool that modifies the environment (create, update, patch, delete,
 * publish). Compliant MCP clients surface their own confirmation step before
 * running a destructive tool.
 *
 * Set `idempotent` when repeating the call with the same arguments has no
 * additional effect (e.g. deleting the same entity twice).
 */
export const defineDestructiveTool = <Args extends ZodRawShapeCompat>(
  name: string,
  description: string,
  inputSchema: Args,
  handler: ToolCallback<Args>,
  options?: { readonly idempotent?: boolean },
): ToolDefinition<Args> => ({
  name,
  description,
  inputSchema,
  handler,
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: options?.idempotent ?? false,
    openWorldHint: false,
  },
});
