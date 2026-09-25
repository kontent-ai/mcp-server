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

# Same, against a clone of the Management API SDK in ../management-sdk-js instead of the published package
npm run dev:shttp:local-sdk   # builds the clone first
npm run test:local-sdk        # build and test against the clone (build:local-sdk for the build alone)

# Start production server (requires build)
npm run start:stdio  # For STDIO transport
npm run start:shttp  # For Streamable HTTP transport
```

### Running against an unreleased Management API SDK

The `*:local-sdk` scripts run this server against a clone of [management-sdk-js](https://github.com/kontent-ai/management-sdk-js) checked out next to this repository (`../management-sdk-js`, with `npm ci` run in it) instead of the published package, so an SDK change can be tried and tested here before it is released. Nothing in `node_modules`, `package.json` or the lockfile changes:

- each script first builds the clone (`node scripts/localSdk.mjs build` runs the clone's `build:commonjs`, which produces the `dist/cjs` Node loads and the declarations TypeScript reads),
- then Node runs with `--import ./scripts/localSdk.mjs`, a resolve hook that answers imports of `@kontent-ai/management-sdk` with the clone in that process only,
- `build:local-sdk` type-checks with `tsconfig.local-sdk.json`, which maps the package to the clone's declarations.

The default `dev:*`, `build` and `test` scripts always use the published SDK, so there is nothing to undo afterwards. Needs Node 22.15 or newer.

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

1. **Transport Layer** (`src/bin.ts`, with the Streamable HTTP app built by `src/app.ts`): Single entry point supporting two transport protocols:
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
   - Must call `get-patch-guide` before any patch operation — the patch tool's own description
     must say **"Always call `get-patch-guide`(entityType='…') first"** with that exact
     "Always" emphasis. A weaker phrasing ("Call… first" without "Always") is regularly ignored
     by the agent in practice. All `patch-*` tool descriptions must use this exact phrasing —
     check for drift when adding or editing one.

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
- Use full entity names: `content-type`, `content-type-snippet`, `content-item`, `content-item-variant`, `taxonomy-group`
- Example: `get-content-type`, `list-content-item-variants`, `get-content-type-snippet`

#### Tool Descriptions
Tool descriptions must follow a standardized pattern (enforced in `.cursor/rules/kontent-tool-descriptions.mdc`):
- Pattern: `"[Action] [Kontent.ai entity] [method/context]"`
- **Always include "Kontent.ai"** explicitly
- Example: "Retrieve Kontent.ai content type by ID"
- **Never phrase a caveat by negation of another tool's keywords, and never embed another
  tool's literal hyphenated name as a cross-reference** — BM25 tool search (see
  `src/test/bm25/CLAUDE.md`) has no concept of negation or reference; both patterns just add
  that other tool's tokens as positive relevance signal to *this* tool's document and can make
  it outrank (or bury) the tool it was trying to point away from/to. State behavior directly
  instead. See `src/test/bm25/CLAUDE.md` ("Two description anti-patterns...") for real regressions
  this caused and how they were fixed.

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

### Testing

`npm run test` builds and runs every `src/test/**/*.spec.ts` with mocha. The suites, by what they protect:

- `src/test/schemas/`, `src/test/utils/`: unit tests of schemas and helpers.
- `src/test/tools/`: registry parity and the read-only / additive / destructive annotation rule.
- `src/test/bm25/`: tool discoverability (see its `CLAUDE.md`).
- `src/test/security/`: the Streamable HTTP app with fake dependencies (authorization ordering).
- `src/test/contract/`: **contract tests**. `contractHarness.ts` starts the real server (Express app, every tool,
  Streamable HTTP transport, as `bin.ts` wires them) against an in-process stub Management API that records each
  request, and calls it with the SDK's HTTP client. A spec asserts two things unit tests cannot: the exact result the
  model receives from a tool call (success text, `isError` text, validation messages) and what the tool sent to the
  Management API (path, body). Use it for any change to a tool's input handling, error text or request shape:
  add a case to an existing spec or a new `*.spec.ts` next to it, with `withContractServer(reply, async ({ client,
  requests }) => ...)`. `reply` decides what the stub answers per request (default: a Management API error body), so
  a branch that depends on a specific Management API response (a 403, a validation error) is one reply away.

To try a change against a real Management API instead, run the server with `manageApiUrl` pointed at it (`npm run
dev:shttp`) and call it with any MCP client; the tool results are the same text the tests assert on.

### Key Implementation Patterns

#### 1. Tool Definition Pattern
Each tool is defined with one of three factories from `src/tools/toolDefinition.ts`, by what it does to the environment:
- `defineReadOnlyTool` — gets, lists, searches (no mutation)
- `defineAdditiveTool` — creates that only add and never overwrite/remove (the `add*` create tools)
- `defineDestructiveTool` — updates, patches, deletes, publishes/unpublishes, and upserts (anything that may overwrite or remove)

The factory sets the correct MCP tool annotations (`readOnlyHint`, `destructiveHint`, `openWorldHint`) so they can never be forgotten:
```typescript
export const myTool = defineReadOnlyTool(
    "tool-name",
    "Tool description", // Following the pattern
    { /* Zod schema for parameters */ },
    async (params, { authInfo: { token, clientId } = {} }) => {
      // Credentials always come from the request. Never read them from
      // process.env here - see "Security Considerations" below.
      const client = createMapiClient(clientId, token);
      try {
        // Implementation
        return createMcpToolSuccessResponse(response);
      } catch (error) {
        return handleMcpToolError(error, "Context");
      }
    },
);
```

For mutating tools pick `defineAdditiveTool` or `defineDestructiveTool` by whether the operation can overwrite or remove existing data.

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
- **`KONTENT_API_KEY` and `KONTENT_ENVIRONMENT_ID` are read in exactly one place: the stdio startup
  in `src/bin.ts`.** Tool modules must never read `process.env` for credentials, and
  `createMapiClient` must never fall back to it. In Streamable HTTP mode every request carries its
  own credentials, so there is deliberately nothing configured to fall back on — a request that
  arrives without them has to fail rather than run under the server's own. Enforced by
  `src/test/security/noAmbientCredentials.spec.ts`; see also `src/clients/credentials.ts`
- Report security issues privately to security@kontent.ai
- All public members should be documented

### Common Development Tasks

1. **Adding a new tool**:
   - Create new file in `src/tools/` using `defineReadOnlyTool`, `defineAdditiveTool`, or `defineDestructiveTool` (see `src/tools/toolDefinition.ts`)
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
   - If an agent has been observed calling the same create/patch tool twice in a row for what
     should be one operation, that's usually a schema validation failure on the first attempt
     (wrong payload shape), not a description/discoverability problem — add a `.describe()`
     annotation documenting the non-obvious constraint it got wrong (e.g. `allowed_formatting`
     requiring `"unstyled"` as the first value if set) rather than editing the tool description

4. **Debugging API issues**:
   - Check request IDs in error responses
   - Use MCP inspector for interactive debugging
   - Verify environment variables are set correctly