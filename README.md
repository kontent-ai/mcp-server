# Kontent.ai MCP Server

[![NPM Version][npm-shield]][npm-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Discord][discord-shield]][discord-url]

> Transform your content operations with AI-powered tools for Kontent.ai. Create, manage, and explore your structured content through natural language conversations in your favorite AI-enabled editor.

Kontent.ai MCP Server implements the Model Context Protocol to connect your Kontent.ai projects with AI tools like Claude, Cursor, and VS Code. It enables AI models to understand your content structure and perform operations through natural language instructions.

## ✨ Key Features

* 🚀 **Rapid prototyping**: Transform your diagrams into live content models in seconds
* 📈 **Data Visualisation**: Visualise your content model in any format you want

## Table of Contents

- [✨ Key Features](#-key-features)
- [🔌 Quickstart](#-quickstart)
- [🛠️ Available Tools](#️-available-tools)
- [⚙️ Configuration](#️-configuration)
- [🔧 Response Optimization](#-response-optimization)
- [🚀 Transport Options](#-transport-options)
- [💻 Development](#-development)
  - [🛠 Local Installation](#-local-installation)
  - [📂 Project Structure](#-project-structure)
  - [🔍 Debugging](#-debugging)
  - [📦 Release Process](#-release-process)
- [License](#license)

## 🔌 Quickstart

### 🔑 Prerequisites

Before you can use the MCP server, you need:

1. **A Kontent.ai account** - [Sign up](https://kontent.ai/signup) if you don't have an account.
1. **A project** - [Create a project](https://kontent.ai/learn/docs/projects#a-create-projects) to work with.
1. **Management API key** - [Create a Management API key](https://kontent.ai/learn/docs/apis/api-keys#a-create-management-api-keys) with appropriate permissions.
1. **Environment ID** - [Get your environment ID](https://kontent.ai/learn/docs/environments#a-get-your-environment-id).

### 🛠 Setup Options

You can run the Kontent.ai MCP Server with npx:

#### STDIO Transport

```bash
npx @kontent-ai/mcp-server@latest stdio
```

#### Streamable HTTP Transport

```bash
npx @kontent-ai/mcp-server@latest shttp
```

## 🛠️ Available Tools

### Context and Setup

* **get-initial-context** – 🚨 **MANDATORY FIRST STEP**: This tool MUST be called before using ANY other tools. It provides essential context, configuration, and operational guidelines for Kontent.ai

### Content Type Management

* **get-type-mapi** – Get Kontent.ai content type by internal ID from Management API
* **list-content-types-mapi** – Get all Kontent.ai content types from Management API
* **add-content-type-mapi** – Add new Kontent.ai content type via Management API
* **patch-content-type-mapi** – Update an existing Kontent.ai content type by codename using patch operations (move, addInto, remove, replace)
* **delete-content-type-mapi** – Delete a Kontent.ai content type by codename

### Content Type Snippet Management

* **get-type-snippet-mapi** – Get Kontent.ai content type snippet by internal ID from Management API
* **list-content-type-snippets-mapi** – Get all Kontent.ai content type snippets from Management API
* **add-content-type-snippet-mapi** – Add new Kontent.ai content type snippet via Management API
* **patch-type-snippet-mapi** – Update an existing Kontent.ai content type snippet by codename using patch operations (move, addInto, remove, replace)
* **delete-type-snippet-mapi** – Delete a Kontent.ai content type snippet by codename

### Taxonomy Management

* **get-taxonomy-group-mapi** – Get Kontent.ai taxonomy group by internal ID from Management API
* **list-taxonomy-groups-mapi** – Get all Kontent.ai taxonomy groups from Management API
* **add-taxonomy-group-mapi** – Add new Kontent.ai taxonomy group via Management API

### Content Item Management

* **get-item-mapi** – Get Kontent.ai item by internal ID from Management API
* **get-item-dapi** – Get Kontent.ai item by codename from Delivery API
* **get-latest-variant-mapi** – Get latest version of Kontent.ai language variant from Management API
* **get-published-variant-mapi** – Get published version of Kontent.ai language variant from Management API
* **list-variants-item-mapi** – List all Kontent.ai language variants of a content item from Management API
* **list-variants-collection-mapi** – List Kontent.ai language variants by collection from Management API (paginated)
* **list-variants-type-mapi** – List Kontent.ai language variants by content type from Management API (paginated)
* **list-variants-components-type-mapi** – List Kontent.ai language variants containing components of a specific content type from Management API (paginated)
* **list-variants-space-mapi** – List Kontent.ai language variants by space from Management API (paginated)
* **add-content-item-mapi** – Add new Kontent.ai content item via Management API. This creates the content item structure but does not add content to language variants. Use upsert-language-variant-mapi to add content to the item
* **update-content-item-mapi** – Update existing Kontent.ai content item by internal ID via Management API. The content item must already exist - this tool will not create new items
* **delete-content-item-mapi** – Delete Kontent.ai content item by internal ID from Management API
* **upsert-language-variant-mapi** – Create or update Kontent.ai language variant of a content item via Management API. This adds actual content to the content item elements. When updating an existing variant, only the provided elements will be modified
* **create-variant-version-mapi** – Create new version of Kontent.ai language variant via Management API. This operation creates a new version of an existing language variant, useful for content versioning and creating new drafts from published content
* **delete-language-variant-mapi** – Delete Kontent.ai language variant from Management API
* **filter-variants-mapi** – Filter Kontent.ai language variants of content items using Management API. Use for exact keyword matching and finding specific terms in content. Supports full filtering capabilities (content types, workflow steps, taxonomies, etc.) and optionally includes full content of variants. Returns paginated results with continuation token for fetching subsequent pages
* **search-variants-mapi** – AI-powered semantic search for finding content by meaning and concepts in a specific language variant. Use for: conceptual searches when you don't know exact keywords. Limited filtering options (variant ID only)

### Asset Management

* **get-asset-mapi** – Get a specific Kontent.ai asset by internal ID from Management API
* **list-assets-mapi** – Get all Kontent.ai assets from Management API

### Language Management

* **list-languages-mapi** – Get all Kontent.ai languages from Management API
* **add-language-mapi** – Add new Kontent.ai language via Management API
* **patch-language-mapi** – Update Kontent.ai language using replace operations via Management API

### Collection Management

* **list-collections-mapi** – Get all Kontent.ai collections from Management API. Collections set boundaries for content items in your environment and help organize content by team, brand, or project
* **patch-collections-mapi** – Update Kontent.ai collections using patch operations (addInto to add new collections, move to reorder, remove to delete empty collections, replace to rename)

### Space Management

* **list-spaces-mapi** – Get all Kontent.ai spaces from Management API

### Workflow Management

* **list-workflows-mapi** – Get all Kontent.ai workflows from Management API. Workflows define the content lifecycle stages and transitions between them
* **change-variant-workflow-step-mapi** – Change the workflow step of a language variant in Kontent.ai. This operation moves a language variant to a different step in the workflow, enabling content lifecycle management such as moving content from draft to review, review to published, etc.
* **publish-variant-mapi** – Publish or schedule a language variant of a content item in Kontent.ai. This operation can either immediately publish the variant or schedule it for publication at a specific future date and time with optional timezone specification
* **unpublish-variant-mapi** – Unpublish or schedule unpublishing of a language variant of a content item in Kontent.ai. This operation can either immediately unpublish the variant (making it unavailable through the Delivery API) or schedule it for unpublishing at a specific future date and time with optional timezone specification

## ⚙️ Configuration

The server supports two configuration modes:

### Single-Tenant Mode (Default)

For single-tenant mode, configure environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| KONTENT_API_KEY | Your Kontent.ai Management API key | ✅ |
| KONTENT_ENVIRONMENT_ID | Your environment ID | ✅ |
| PORT | Port for HTTP transport (defaults to 3001) | ❌ |
| appInsightsConnectionString | Application Insights connection string for telemetry | ❌ |
| projectLocation | Project location identifier for telemetry tracking | ❌ |
| manageApiUrl | Custom Management API base URL (for preview environments) | ❌ |

### Multi-Tenant Mode

For multi-tenant mode (Streamable HTTP only), the server accepts:
- **Environment ID** as a URL path parameter: `/{environmentId}/mcp`
- **API Key** via Bearer token in the Authorization header: `Authorization: Bearer <api-key>`

This mode allows a single server instance to handle requests for multiple Kontent.ai environments securely without requiring environment variables.

## 🔧 Response Optimization

The MCP server implements automatic token optimization to reduce AI model costs and improve performance:

### Token Reduction Strategy

The server automatically removes empty/default values from responses to reduce token usage. This includes:

- Null and undefined values
- Empty strings (`""`)
- Empty arrays (`[]`)
- Empty objects (`{}`)
- Rich text placeholders (`"<p><br/></p>"`)
- Elements with only an ID after empty value removal

### Impact on AI Agents

**Important for AI implementations**: When consuming responses from this MCP server:

1. **Missing properties indicate default values**, not missing data
2. Missing elements in variants have their type-specific defaults:
   - Text elements: `""` (empty string)
   - Rich text: `"<p><br/></p>"` (empty placeholder)
   - Number/Date: `null`
   - Custom elements: `null` (for value and searchable_value)
   - Arrays (assets, taxonomy, etc.): `[]`
3. When creating/updating content, always send complete data

## 🚀 Transport Options

### 📟 STDIO Transport

To run the server with STDIO transport, configure your MCP client with:

```json
{
  "kontent-ai-stdio": {
      "command": "npx",
      "args": ["@kontent-ai/mcp-server@latest", "stdio"],
      "env": {
        "KONTENT_API_KEY": "<management-api-key>",
        "KONTENT_ENVIRONMENT_ID": "<environment-id>"
      }
    }
}
```

### 🌊 Streamable HTTP Transport

For Streamable HTTP transport, first start the server:

```bash
npx @kontent-ai/mcp-server@latest shttp
```

#### Single-Tenant Mode

With environment variables in a `.env` file, or otherwise accessible to the process:
```env
KONTENT_API_KEY=<management-api-key>
KONTENT_ENVIRONMENT_ID=<environment-id>
PORT=3001  # optional, defaults to 3001
```

Then configure your MCP client:
```json
{
  "kontent-ai-http": {
    "url": "http://localhost:3001/mcp"
  }
}
```

#### Multi-Tenant Mode

No environment variables required. The server accepts requests for multiple environments using URL path parameters and Bearer authentication.

<details>
<summary><strong>VS Code</strong></summary>

Create a `.vscode/mcp.json` file in your workspace:

```json
{
  "servers": {
    "kontent-ai-multi": {
      "uri": "http://localhost:3001/<environment-id>/mcp",
      "headers": {
        "Authorization": "Bearer <management-api-key>"
      }
    }
  }
}
```

For secure configuration with input prompts:

```json
{
  "inputs": [
    {
      "id": "apiKey",
      "type": "password",
      "description": "Kontent.ai API Key"
    },
    {
      "id": "environmentId",
      "type": "text",
      "description": "Environment ID"
    }
  ],
  "servers": {
    "kontent-ai-multi": {
      "uri": "http://localhost:3001/${inputs.environmentId}/mcp",
      "headers": {
        "Authorization": "Bearer ${inputs.apiKey}"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Update your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Use `mcp-remote` as a proxy to add authentication headers:

```json
{
  "mcpServers": {
    "kontent-ai-multi": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:3001/<environment-id>/mcp",
        "--header",
        "Authorization: Bearer <management-api-key>"
      ]
    }
  }
}
```

</details>

<details>
<summary><strong>Claude Code</strong></summary>

Add the server using the CLI:

```bash
claude mcp add --transport http kontent-ai-multi \
  "http://localhost:3001/<environment-id>/mcp" \
  --header "Authorization: Bearer <management-api-key>"
```

> **Note**: You can also configure this in your Claude Code settings JSON with the `url` and `headers` properties.

</details>

> [!IMPORTANT]
> Replace `<environment-id>` with your Kontent.ai environment ID (GUID) and `<management-api-key>` with your Management API key.

## 💻 Development

### 🛠 Local Installation

```bash
# Clone the repository
git clone https://github.com/kontent-ai/mcp-server.git
cd mcp-server

# Install dependencies
npm ci

# Build the project
npm run build

# Start the server
npm run start:stdio  # For STDIO transport
npm run start:shttp  # For Streamable HTTP transport

# Start the server with automatic reloading (no need to build first)
npm run dev:stdio  # For STDIO transport
npm run dev:shttp  # For Streamable HTTP transport
```

### 📂 Project Structure

- `src/` - Source code
  - `tools/` - MCP tool implementations
  - `clients/` - Kontent.ai API client setup
  - `schemas/` - Data validation schemas
  - `utils/` - Utility functions
    - `errorHandler.ts` - Standardized error handling for MCP tools
    - `throwError.ts` - Generic error throwing utility
  - `server.ts` - Main server setup and tool registration
  - `bin.ts` - Single entry point that handles both transport types

### 🔍 Debugging

For debugging, you can use the MCP inspector:

```bash
npx @modelcontextprotocol/inspector -e KONTENT_API_KEY=<key> -e KONTENT_ENVIRONMENT_ID=<env-id> node path/to/build/bin.js
```

Or use the MCP inspector on a running streamable HTTP server:

```bash
npx @modelcontextprotocol/inspector
```

This provides a web interface for inspecting and testing the available tools.

### 📦 Release Process

To release a new version:

1. Bump the version using `npm version [patch|minor|major]` - this updates `package.json`, `package-lock.json`, and syncs to `server.json`
2. Push the commit to your branch and create a pull request
3. Merge the pull request
4. Create a new GitHub release with the version number as both name and tag, using auto-generated release notes
5. Publishing the release triggers an automated workflow that publishes to npm and GitHub MCP registry

## License

MIT 

[contributors-shield]: https://img.shields.io/github/contributors/kontent-ai/mcp-server.svg?style=for-the-badge
[contributors-url]: https://github.com/kontent-ai/mcp-server/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kontent-ai/mcp-server.svg?style=for-the-badge
[forks-url]: https://github.com/kontent-ai/mcp-server/network/members
[stars-shield]: https://img.shields.io/github/stars/kontent-ai/mcp-server.svg?style=for-the-badge
[stars-url]: https://github.com/kontent-ai/mcp-server/stargazers
[issues-shield]: https://img.shields.io/github/issues/kontent-ai/mcp-server.svg?style=for-the-badge
[issues-url]: https://github.com/kontent-ai/mcp-server/issues
[license-shield]: https://img.shields.io/github/license/kontent-ai/mcp-server.svg?style=for-the-badge
[license-url]: https://github.com/kontent-ai/mcp-server/blob/master/LICENSE.md
[discord-shield]: https://img.shields.io/discord/821885171984891914?color=%237289DA&label=Kontent.ai%20Discord&logo=discord&style=for-the-badge
[discord-url]: https://discord.com/invite/SKCxwPtevJ
[npm-url]: https://www.npmjs.com/package/@kontent-ai/mcp-server
[npm-shield]: https://img.shields.io/npm/v/%40kontent-ai%2Fmcp-server?style=for-the-badge&logo=npm&color=%23CB0000
