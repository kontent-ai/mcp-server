import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../package.json" with { type: "json" };
import { allTools } from "./tools/index.js";
import type { ToolDefinition } from "./tools/toolDefinition.js";

// Registering each tool individually (rather than looping over the union type
// `Object.values(allTools)` produces) keeps every tool's inputSchema paired
// with its own handler. Once enough tools share overlapping parameter names
// (e.g. environmentId), TypeScript can no longer verify that pairing across
// the whole union and this signature is the escape hatch: each tool's own
// definition site already guarantees inputSchema and handler match.
// biome-ignore lint/suspicious/noExplicitAny: existential erasure, see above
const registerTool = (server: McpServer, tool: ToolDefinition<any>): void => {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    },
    tool.handler,
  );
};

export const createServer = () => {
  const server = new McpServer({
    name: "kontent-ai",
    version: packageJson.version,
  });

  for (const tool of Object.values(allTools)) {
    registerTool(server, tool);
  }

  return { server };
};
