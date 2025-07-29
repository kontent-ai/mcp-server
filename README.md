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

### Taxonomy Management

* **get-taxonomy-group-mapi** – Get Kontent.ai taxonomy group by internal ID from Management API
* **list-taxonomy-groups-mapi** – Get all Kontent.ai taxonomy groups from Management API
* **add-taxonomy-group-mapi** – Add new Kontent.ai taxonomy group via Management API

### Content Item Management

* **get-item-mapi** – Get Kontent.ai item by internal ID from Management API
* **get-item-dapi** – Get Kontent.ai item by codename from Delivery API
* **get-variant-mapi** – Get Kontent.ai language variant of content item from Management API
* **add-content-item-mapi** – Add new Kontent.ai content item via Management API. This creates the content item structure but does not add content to language variants. Use upsert-language-variant-mapi to add content to the item
* **update-content-item-mapi** – Update existing Kontent.ai content item by internal ID via Management API. The content item must already exist - this tool will not create new items
* **delete-content-item-mapi** – Delete Kontent.ai content item by internal ID from Management API
* **upsert-language-variant-mapi** – Create or update Kontent.ai language variant of a content item via Management API. This adds actual content to the content item elements. When updating an existing variant, only the provided elements will be modified
* **delete-language-variant-mapi** – Delete Kontent.ai language variant from Management API
* **filter-variants-mapi** – Search and filter Kontent.ai language variants of content items using Management API

### Asset Management

* **get-asset-mapi** – Get a specific Kontent.ai asset by internal ID from Management API
* **list-assets-mapi** – Get all Kontent.ai assets from Management API

### Language Management

* **list-languages-mapi** – Get all Kontent.ai languages from Management API

### Workflow Management

* **list-workflows-mapi** – Get all Kontent.ai workflows from Management API. Workflows define the content lifecycle stages and transitions between them
* **change-variant-workflow-step-mapi** – Change the workflow step of a language variant in Kontent.ai. This operation moves a language variant to a different step in the workflow, enabling content lifecycle management such as moving content from draft to review, review to published, etc.
* **publish-variant-mapi** – Publish or schedule a language variant of a content item in Kontent.ai. This operation can either immediately publish the variant or schedule it for publication at a specific future date and time with optional timezone specification
* **unpublish-variant-mapi** – Unpublish or schedule unpublishing of a language variant of a content item in Kontent.ai. This operation can either immediately unpublish the variant (making it unavailable through the Delivery API) or schedule it for unpublishing at a specific future date and time with optional timezone specification

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

### 🌊 Streamable HTTP Transport

For Streamable HTTP transport, first start the server:

```bash
npx @kontent-ai/mcp-server@latest shttp
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
  "kontent-ai-http": {
    "url": "http://localhost:3001/mcp"
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
npm run start:shttp  # For Streamable HTTP transport

# Start the server with automatic reloading (no need to build first)
npm run dev:sse  # For SSE transport
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