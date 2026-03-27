import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../package.json" with { type: "json" };
import { allTools } from "./tools/index.js";

// Create server instance
export const createServer = () => {
  const server = new McpServer({
    name: "kontent-ai",
    version: packageJson.version,
  });

  // Register all tools
  for (const tool of Object.values(allTools)) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema },
      tool.handler,
    );
  }

  return { server };
};
