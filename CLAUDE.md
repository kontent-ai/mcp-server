# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development Commands
```bash
# Install dependencies
npm ci

# Build the project (TypeScript compilation)
npm run build

# Start development server with auto-reload (no build required)
npm run dev:stdio   # For STDIO transport
npm run dev:shttp   # For Streamable HTTP transport

# Start production server (requires build)
npm run start:stdio  # For STDIO transport
npm run start:shttp  # For Streamable HTTP transport
```

### Code Quality Commands
```bash
# Run formatter and linter check
npm run format

# Auto-fix formatting and linting issues
npm run format:fix
```

### Debugging
```bash
# Debug with MCP inspector
npx @modelcontextprotocol/inspector -e KONTENT_API_KEY=<key> -e KONTENT_ENVIRONMENT_ID=<env-id> node build/bin.js

# Or inspect streamable HTTP server
npx @modelcontextprotocol/inspector
```

## Architecture Overview

This is a Model Context Protocol (MCP) server for Kontent.ai that enables AI models to interact with Kontent.ai's APIs through natural language. The project follows a modular architecture:

### Core Components

1. **Transport Layer** (`src/bin.ts`): Single entry point supporting two transport protocols:
   - STDIO: Direct process communication (single-tenant only)
   - Streamable HTTP: Request-response based HTTP communication (supports multi-tenant)

2. **Server Core** (`src/server.ts`): Central server instance that:
   - Registers all available tools
   - Manages MCP server lifecycle
   - Coordinates tool execution

3. **Tools Directory** (`src/tools/`): Each tool is a separate module that:
   - Implements a specific Kontent.ai operation
   - Uses standardized error handling via `errorHandler.ts`
   - Returns responses using `createMcpToolSuccessResponse`
   - Must call `get-patch-guide` before any patch operation

4. **API Clients** (`src/clients/kontentClients.ts`): Manages Kontent.ai SDK instances:
   - Management API client for content operations
   - Includes source tracking headers for API usage analytics

5. **Validation Schemas** (`src/schemas/`): Zod schemas for input validation:
   - Content item, content type, taxonomy schemas
   - Specialized patch operation schemas
   - Workflow and variant filtering schemas

### Critical Development Rules

#### Tool Naming Conventions
Tools follow strict naming patterns enforced by Cursor rules:
- Format: `[action]-[entity]`
- Use full entity names: `content-type`, `content-type-snippet`, `content-item`, `item-variant`, `taxonomy-group`
- Example: `get-content-type`, `filter-item-variants`, `get-content-type-snippet`

#### Tool Descriptions
Tool descriptions must follow a standardized pattern (enforced in `.cursor/rules/kontent-tool-descriptions.mdc`):
- Pattern: `"[Action] [Kontent.ai entity] [method/context]"`
- **Always include "Kontent.ai"** explicitly
- Example: "Get Kontent.ai content type by internal ID"

#### README Synchronization
When modifying tools (enforced in `.cursor/rules/tools-in-readme.mdc`):
- **Adding tools**: Always describe them in README.md
- **Modifying tools**: Adjust descriptions in README.md accordingly
- **Removing tools**: Remove all mentions from README.md
- **Table of Contents**: Must contain only second-level headings (enforced in `.cursor/rules/toc-readme.mdc`)

### Environment Requirements

#### Transport-to-Mode Mapping
- **STDIO** = Single-tenant (credentials via env vars, local process communication)
- **Streamable HTTP** = Multi-tenant (credentials via Bearer token per request)

#### Single-Tenant Mode (STDIO)
Required environment variables:
- `KONTENT_API_KEY`: Management API key
- `KONTENT_ENVIRONMENT_ID`: Environment ID

Optional telemetry and configuration variables:
- `appInsightsConnectionString`: Application Insights connection string for telemetry
- `projectLocation`: Project location identifier for telemetry tracking
- `manageApiUrl`: Custom Management API base URL (e.g., for preview environments)

#### Multi-Tenant Mode (Streamable HTTP)
No credential environment variables required. Instead:
- Environment ID is provided via URL path: `/{environmentId}/mcp`
- API key is provided via Bearer token: `Authorization: Bearer <api-key>`
- `PORT`: Server port (optional, defaults to 3001)

##### Client Configuration Examples

**VS Code**: Create `.vscode/mcp.json` in your workspace:
```json
{
  "servers": {
    "kontent-ai-multi": {
      "uri": "http://localhost:3001/{environmentId}/mcp",
      "headers": {
        "Authorization": "Bearer {api-key}"
      }
    }
  }
}
```

**Claude Desktop**: Use `mcp-remote` as proxy in `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "kontent-ai-multi": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:3001/{environmentId}/mcp",
        "--header",
        "Authorization: Bearer {api-key}"
      ]
    }
  }
}
```

**Claude Code**: Configure via CLI:
```bash
claude mcp add --transport http kontent-ai-multi \
  "http://localhost:3001/{environmentId}/mcp" \
  --header "Authorization: Bearer {api-key}"
```

### Code Style

- TypeScript with ES2022 target, NodeNext modules
- Biome for formatting and linting (configuration in `biome.json`)
- Double quotes for strings
- 2-space indentation
- Strict TypeScript mode enabled
- Organize imports on save

### Key Implementation Patterns

#### 1. Tool Definition Pattern
Each tool is defined using `createTool` (returns a `ToolDefinition` object) with an inner `defineTool` wrapper for formatting:
```typescript
export const myTool = createTool(
  ...defineTool(
    "tool-name",
    "Tool description", // Following the pattern
    { /* Zod schema for parameters */ },
    async (params) => {
      const client = createMapiClient();
      try {
        // Implementation
        return createMcpToolSuccessResponse(response);
      } catch (error) {
        return handleMcpToolError(error, "Context");
      }
    },
  ),
);
```

Tools are collected in `src/tools/index.ts` as an `allTools` object and registered in `server.ts` via `server.registerTool()`.

#### 2. Error Handling
The `errorHandler.ts` provides standardized error handling:
- Handles Kontent.ai Management API specific errors
- Includes validation error details
- Provides consistent error response format
- Preserves request IDs for debugging

#### 3. Patch Operations
Content type modifications use patch operations:
- **move**: Move elements within content type (uses path references like `/elements/id:{uuid}`)
- **addInto**: Add new elements to content type
- **remove**: Remove elements from content type
- **replace**: Replace element properties

### Contributing Guidelines

When contributing:
1. Follow semantic versioning
2. Ensure CI can build the code
3. Update documentation (README.md, code comments)
4. Code must not contain secrets
5. Clear commit messages following best practices

### Security Considerations

- Never commit API keys or secrets
- Use environment variables for sensitive configuration
- Report security issues privately to security@kontent.ai
- All public members should be documented

### Common Development Tasks

1. **Adding a new tool**:
   - Create new file in `src/tools/` using `createTool`/`defineTool` (see `src/tools/toolDefinition.ts`)
   - Follow naming convention: `[action]-[entity]` format
   - Add the export to `allTools` object in `src/tools/index.ts`
   - Update README.md with tool description
   - Update BM25 search tests and verify discoverability — see `src/test/bm25/CLAUDE.md`

2. **Modifying or removing a tool**:
   - Keep `src/tools/index.ts` and BM25 search tests in sync — see `src/test/bm25/CLAUDE.md`

3. **Modifying schemas**:
   - Update relevant file in `src/schemas/`
   - Ensure backward compatibility
   - Update related tool implementations

4. **Debugging API issues**:
   - Check request IDs in error responses
   - Use MCP inspector for interactive debugging
   - Verify environment variables are set correctly