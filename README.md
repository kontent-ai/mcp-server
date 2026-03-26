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
1. **Management API key** - [Create a key](https://kontent.ai/learn/docs/apis/api-keys#a-create-management-api-keys) with appropriate permissions.
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

### Patch Operations Guide

* **get-patch-guide** – 🚨 **REQUIRED before any patch operation**. Get patch operations guide for Kontent.ai by entity type

### Content Type Management

* **get-content-type** – Get Kontent.ai content type by internal ID
* **list-content-types** – Get all Kontent.ai content types
* **add-content-type** – Add new Kontent.ai content type
* **patch-content-type** – Update an existing Kontent.ai content type by codename using patch operations (move, addInto, remove, replace)
* **delete-content-type** – Delete a Kontent.ai content type by internal ID

### Content Type Snippet Management

* **get-content-type-snippet** – Get Kontent.ai content type snippet by internal ID
* **list-content-type-snippets** – Get all Kontent.ai content type snippets
* **add-content-type-snippet** – Add new Kontent.ai content type snippet
* **patch-content-type-snippet** – Update an existing Kontent.ai content type snippet by internal ID using patch operations (move, addInto, remove, replace)
* **delete-content-type-snippet** – Delete a Kontent.ai content type snippet by internal ID

### Taxonomy Management

* **get-taxonomy-group** – Get Kontent.ai taxonomy group by internal ID
* **list-taxonomy-groups** – Get all Kontent.ai taxonomy groups
* **add-taxonomy-group** – Add new Kontent.ai taxonomy group
* **patch-taxonomy-group** – Update Kontent.ai taxonomy group using patch operations (addInto, move, remove, replace)
* **delete-taxonomy-group** – Delete Kontent.ai taxonomy group by internal ID

### Content Item Management

* **get-content-item** – Get Kontent.ai content item by internal ID
* **get-latest-item-variant** – Get latest version of Kontent.ai item variant
* **get-published-item-variant** – Get published version of Kontent.ai item variant
* **get-item-variants** – Get all Kontent.ai item variants of a content item
* **list-item-variants-by-collection** – List Kontent.ai item variants by collection (paginated)
* **list-item-variants-by-content-type** – List Kontent.ai item variants by content type (paginated)
* **list-item-variants-by-component-type** – List Kontent.ai item variants containing components of a specific content type (paginated)
* **list-item-variants-by-space** – List Kontent.ai item variants by space (paginated)
* **add-content-item** – Add new Kontent.ai content item. This creates the content item structure but does not add content to item variants. Use create-item-variant to add content to the item
* **update-content-item** – Update existing Kontent.ai content item by internal ID. The content item must already exist - this tool will not create new items
* **delete-content-item** – Delete Kontent.ai content item by internal ID
* **create-item-variant** – Create Kontent.ai item variant assigning current user as contributor. Element values must fulfill limitations and guidelines defined in content type
* **update-item-variant** – Update Kontent.ai item variant of a content item. Element values must fulfill limitations and guidelines defined in content type. Only provided elements will be modified
* **create-new-item-variant-version** – Create new version of Kontent.ai item variant. This operation creates a new version of an existing item variant, useful for content versioning and creating new drafts from published content
* **delete-item-variant** – Delete Kontent.ai item variant
* **filter-item-variants** – Filter Kontent.ai items with variants returning references (item ID + language ID). Use for exact keyword matching and finding specific terms in content. Supports full filtering capabilities (content types, workflow steps, taxonomies, spaces, collections, publishing states, etc.). Returns paginated results with continuation token for fetching subsequent pages. Use bulk-get-item-variants to retrieve full content for matched items
* **bulk-get-item-variants** – Bulk get Kontent.ai content items with their item variants by item and language reference pairs. Use after filter-item-variants to retrieve full content data for specific item+language pairs. Items without a variant in the requested language return the item without the variant property. Returns paginated results with continuation token
* **search-item-variants** – AI-powered semantic search for finding content by meaning and concepts in a specific item variant. Use for: conceptual searches when you don't know exact keywords. Limited filtering options (variant ID only)

### Asset Management

* **get-asset** – Get a specific Kontent.ai asset by internal ID
* **list-assets** – Get all Kontent.ai assets
* **update-asset** – Update Kontent.ai asset by internal ID

### Asset Folder Management

* **list-asset-folders** – List all Kontent.ai asset folders
* **patch-asset-folders** – Modify Kontent.ai asset folders using patch operations (addInto to add new folders, rename to change names, remove to delete folders)

### Language Management

* **list-languages** – Get all Kontent.ai languages (includes both active and inactive - check is_active property)
* **add-language** – Add new Kontent.ai language (languages are always created as active)
* **patch-language** – Update Kontent.ai language using replace operations (only active languages can be modified - to activate/deactivate, use the Kontent.ai web UI)

### Collection Management

* **list-collections** – Get all Kontent.ai collections. Collections set boundaries for content items in your environment and help organize content by team, brand, or project
* **patch-collections** – Update Kontent.ai collections using patch operations (addInto to add new collections, move to reorder, remove to delete empty collections, replace to rename)

### Space Management

* **list-spaces** – Get all Kontent.ai spaces
* **add-space** – Add Kontent.ai space to environment
* **patch-space** – Patch Kontent.ai space using replace operations
* **delete-space** – Delete Kontent.ai space

### Role Management

* **list-roles** – Get all Kontent.ai roles. Requires Enterprise or Flex plan with "Manage custom roles" permission

### Workflow Management

* **list-workflows** – Get all Kontent.ai workflows. Workflows define the content lifecycle stages and transitions between them
* **add-workflow** – Create a new Kontent.ai workflow. Define custom workflow steps, transitions, scopes (content types and collections), and role permissions
* **update-workflow** – Update an existing Kontent.ai workflow by ID. Modify steps, transitions, scopes, and role permissions. Cannot remove steps that are in use
* **delete-workflow** – Delete a Kontent.ai workflow by ID. The workflow must not be in use by any content items
* **change-item-variant-workflow-step** – Change the workflow step of an item variant in Kontent.ai. This operation moves an item variant to a different step in the workflow, enabling content lifecycle management such as moving content from draft to review, review to published, etc.
* **publish-item-variant** – Publish or schedule an item variant of a content item in Kontent.ai. This operation can either immediately publish the variant or schedule it for publication at a specific future date and time with optional timezone specification
* **unpublish-item-variant** – Unpublish or schedule unpublishing of an item variant of a content item in Kontent.ai. This operation can either immediately unpublish the variant (making it unavailable through the Delivery API) or schedule it for unpublishing at a specific future date and time with optional timezone specification

## ⚙️ Configuration

The server supports two modes, each tied to its transport:

| Transport | Mode | Authentication | Use Case |
|-----------|------|----------------|----------|
| **STDIO** | Single-tenant | Environment variables | Local communication with a single Kontent.ai environment |
| **Streamable HTTP** | Multi-tenant | Bearer token per request | Remote/shared server handling multiple environments |

### Single-Tenant Mode (STDIO)

Configure credentials via environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| KONTENT_API_KEY | Your Kontent.ai key | ✅ |
| KONTENT_ENVIRONMENT_ID | Your environment ID | ✅ |
| appInsightsConnectionString | Application Insights connection string for telemetry | ❌ |
| projectLocation | Project location identifier for telemetry tracking | ❌ |
| manageApiUrl | Custom base URL (for preview environments) | ❌ |

### Multi-Tenant Mode (Streamable HTTP)

For the Streamable HTTP transport, credentials are provided per request:
- **Environment ID** as a URL path parameter: `/{environmentId}/mcp`
- **API Key** via Bearer token in the Authorization header: `Authorization: Bearer <api-key>`

This allows a single server instance to handle requests for multiple Kontent.ai environments without requiring credential environment variables.

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Port for HTTP transport (defaults to 3001) | ❌ |
| appInsightsConnectionString | Application Insights connection string for telemetry | ❌ |
| projectLocation | Project location identifier for telemetry tracking | ❌ |
| manageApiUrl | Custom base URL (for preview environments) | ❌ |

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

### 🌊 Streamable HTTP Transport (Multi-Tenant)

Streamable HTTP transport serves multiple Kontent.ai environments from a single server instance. Each request provides credentials via URL path parameters and Bearer authentication.

First start the server:

```bash
npx @kontent-ai/mcp-server@latest shttp
```

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
> Replace `<environment-id>` with your Kontent.ai environment ID (GUID) and `<management-api-key>` with your key.

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
