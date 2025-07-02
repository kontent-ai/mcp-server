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

#### SSE Transport

```bash
npx @kontent-ai/mcp-server@latest sse
```

## 🛠️ Available Tools

### Context and Setup

* **get-initial-context** – 🚨 **MANDATORY FIRST STEP**: Provides essential context, configuration, and operational guidelines for Kontent.ai. This tool MUST be called before using any other tools to understand the platform structure, core entities, relationships, and best practices.

### Content Type Management

* **get-type-mapi** – Get a specific content type by internal ID
* **list-content-types-mapi** – List all content types in the environment
* **add-content-type-mapi** – Create a new content type with elements
* **patch-content-type-mapi** – Update an existing content type by codename using patch operations (move, addInto, remove, replace)

### Content Type Snippet Management

* **get-type-snippet-mapi** – Get a specific content type snippet by internal ID
* **list-content-type-snippets-mapi** – List all content type snippets
* **add-content-type-snippet-mapi** – Create a new content type snippet

### Taxonomy Management

* **get-taxonomy-group-mapi** – Get a specific taxonomy group by internal ID
* **list-taxonomy-groups-mapi** – List all taxonomy groups
* **add-taxonomy-group-mapi** – Create a new taxonomy group with terms

### Content Item Management

* **get-item-mapi** – Get a specific content item by internal ID
* **get-item-dapi** – Get a content item by codename from Delivery API
* **get-variant-mapi** – Get a language variant of a content item by internal IDs
* **add-content-item-mapi** – Create a new content item (structure only)
* **update-content-item-mapi** – Update an existing content item by internal ID (name, collection)
* **delete-content-item-mapi** – Delete a content item by internal ID
* **upsert-language-variant-mapi** – Create or update a language variant with content using internal IDs
* **delete-language-variant-mapi** – Delete a language variant of a content item by internal IDs
* **filter-variants-mapi** – Search and filter language variants using filters and search phrases

### Asset Management

* **get-asset-mapi** – Get a specific asset by internal ID
* **list-assets-mapi** – List all assets in the environment

### Language Management

* **list-languages-mapi** – List all languages configured in the environment

### Workflow Management

* **list-workflows-mapi** – List all workflows in the environment with their lifecycle stages and transitions
* **change-variant-workflow-step-mapi** – Change the workflow step of a language variant (move content through workflow stages)
* **publish-variant-mapi** – Publish or schedule a language variant for publication. Supports immediate publishing (happens right now) or scheduled publishing at a specific future date and time with optional timezone specification
* **unpublish-variant-mapi** – Unpublish or schedule unpublishing of a language variant. Supports immediate unpublishing (removes content from Delivery API right now) or scheduled unpublishing at a specific future date and time with optional timezone specification

### Utility

* **get-current-datetime** – Get the current date and time in UTC (ISO-8601 format)

## ⚙️ Configuration

The server requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| KONTENT_API_KEY | Your Kontent.ai Management API key | ✅ |
| KONTENT_ENVIRONMENT_ID | Your environment ID | ✅ |
| PORT | Port for SSE transport (defaults to 3001) | ❌ |

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

### 🌐 SSE Transport

For SSE transport, first start the server:

```bash
npx @kontent-ai/mcp-server@latest sse
```

With environment variables in a `.env` file, or otherwise accessible to the process:
```env
KONTENT_API_KEY=<management-api-key>
KONTENT_ENVIRONMENT_ID=<environment-id>
PORT=3001  # optional, defaults to 3001
```

Then configure your MCP client:
```json
{
  "kontent-ai-sse": {
    "url": "http://localhost:3001/sse"
  }
}
```

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
npm run start:sse  # For SSE transport
npm run start:stdio  # For STDIO transport

# Start the server with automatic reloading (no need to build first)
npm run dev:sse  # For SSE transport
npm run dev:stdio  # For STDIO transport
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

Or use the MCP inspector on a running sse server:

```bash
npx @modelcontextprotocol/inspector
```

This provides a web interface for inspecting and testing the available tools.

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