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
   - Must call `get-initial-context` before any other operation

4. **API Clients** (`src/clients/kontentClients.ts`): Manages Kontent.ai SDK instances:
   - Management API client for content operations
   - Delivery API client for read-only content access
   - Includes source tracking headers for API usage analytics

5. **Validation Schemas** (`src/schemas/`): Zod schemas for input validation:
   - Content item, content type, taxonomy schemas
   - Specialized patch operation schemas
   - Workflow and variant filtering schemas

### Critical Development Rules

#### Tool Naming Conventions
Tools follow strict naming patterns enforced by Cursor rules:
- **Names must be under 35 characters** (enforced in `.cursor/rules/mcp-tool-naming.mdc`)
- Format: `[action]-[entity]-[api-suffix]`
- API suffixes: `-mapi` (Management API), `-dapi` (Delivery API)
- Example: `get-content-type-mapi`, `filter-variants-mapi`

#### Tool Descriptions
Tool descriptions must follow a standardized pattern (enforced in `.cursor/rules/kontent-tool-descriptions.mdc`):
- Pattern: `"[Action] [Kontent.ai entity] [method/context] [API source]"`
- **Always include "Kontent.ai"** explicitly
- **Always specify the API source**
- Example: "Get Kontent.ai content type by internal ID from Management API"

#### README Synchronization
When modifying tools (enforced in `.cursor/rules/tools-in-readme.mdc`):
- **Adding tools**: Always describe them in README.md
- **Modifying tools**: Adjust descriptions in README.md accordingly
- **Removing tools**: Remove all mentions from README.md
- **Table of Contents**: Must contain only second-level headings (enforced in `.cursor/rules/toc-readme.mdc`)

### Environment Requirements

#### Single-Tenant Mode
Required environment variables:
- `KONTENT_API_KEY`: Management API key
- `KONTENT_ENVIRONMENT_ID`: Environment ID
- `PORT`: Server port (optional, defaults to 3001)

#### Multi-Tenant Mode (Streamable HTTP only)
No environment variables required. Instead:
- Environment ID is provided via URL path: `/{environmentId}/mcp`
- API key is provided via Bearer token: `Authorization: Bearer <api-key>`

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

**Claude Code**: Configure via CLI or settings:
```bash
claude mcp add \
  --url "http://localhost:3001/{environmentId}/mcp" \
  --header "Authorization: Bearer {api-key}" \
  kontent-ai-multi
```

### Code Style

- TypeScript with ES2022 target, NodeNext modules
- Biome for formatting and linting (configuration in `biome.json`)
- Double quotes for strings
- 2-space indentation
- Strict TypeScript mode enabled
- Organize imports on save

### Key Implementation Patterns

#### 1. Tool Registration Pattern
Each tool follows this structure:
```typescript
export const registerTool = (server: McpServer): void => {
  server.tool(
    "tool-name", // Under 35 characters
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
    }
  );
};
```

#### 2. Error Handling
The `errorHandler.ts` provides standardized error handling:
- Handles Kontent.ai Management API specific errors
- Includes validation error details
- Provides consistent error response format
- Preserves request IDs for debugging

#### 3. Patch Operations
Content type modifications use JSON Patch operations:
- **move**: Move elements within content type (uses path references like `/elements/id:{uuid}`)
- **addInto**: Add new elements to content type
- **remove**: Remove elements from content type
- **replace**: Replace element properties

### Contributing Guidelines

When contributing:
1. **No test files exist currently** - consider adding tests for new features
2. Follow semantic versioning
3. Ensure CI can build the code
4. Update documentation (README.md, code comments)
5. Code must not contain secrets
6. Clear commit messages following best practices

### Security Considerations

- Never commit API keys or secrets
- Use environment variables for sensitive configuration
- Report security issues privately to security@kontent.ai
- All public members should be documented

### Common Development Tasks

1. **Adding a new tool**:
   - Create new file in `src/tools/`
   - Follow naming convention (under 35 chars, proper suffix)
   - Implement using the standard pattern
   - Register in `src/server.ts`
   - Update README.md with tool description

2. **Modifying schemas**:
   - Update relevant file in `src/schemas/`
   - Ensure backward compatibility
   - Update related tool implementations

3. **Debugging API issues**:
   - Check request IDs in error responses
   - Use MCP inspector for interactive debugging
   - Verify environment variables are set correctly