import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../package.json" with { type: "json" };
import { allTools } from "./tools/index.js";

export const createServer = () => {
  const server = new McpServer({
    name: "kontent-ai",
    version: packageJson.version,
  });

  for (const tool of Object.values(allTools)) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      tool.handler,
    );
  }

  return { server };
};
