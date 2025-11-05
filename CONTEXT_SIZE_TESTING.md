# MCP Context Size Testing Guide

## Overview

This guide explains how to measure, test, and optimize the context size (token count) of your MCP server tools. Large context sizes can impact performance and costs, so it's important to monitor and optimize them.

**Current Baseline**: 33,126 tokens
**Target**: < 30,000 tokens for optimal performance

---

## Table of Contents

1. [Understanding MCP Context Size](#understanding-mcp-context-size)
2. [Quick Start - Measuring Context Size](#quick-start---measuring-context-size)
3. [Automated Testing](#automated-testing)
4. [Testing in Claude Desktop vs Claude Code](#testing-in-claude-desktop-vs-claude-code)
5. [Optimization Strategies](#optimization-strategies)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## Understanding MCP Context Size

### What Counts as "Context"?

When an AI client (Claude Desktop, Claude Code, etc.) connects to your MCP server, it receives:

1. **Tool Definitions** (largest contributor):
   - Tool name
   - Tool description
   - Input schema (Zod schemas with `.describe()`)

2. **Resources** (if any):
   - Resource URIs
   - Resource metadata

3. **Prompts** (if any):
   - Prompt templates
   - Prompt descriptions

For this MCP server, **tools are the primary contributor** to context size.

### Why Does Context Size Matter?

- **Performance**: Large contexts slow down LLM processing
- **Cost**: Some LLM APIs charge per token (input + output)
- **Quality**: Very large contexts can dilute relevant information
- **Limits**: Most LLMs have context window limits (though Claude has large windows)

### Token Estimation

Approximate token calculation:
- **1 token ≈ 4 characters** (English text)
- **1 token ≈ 0.75 words** (English text)

Example:
```
"Get Kontent.ai content type by internal ID from Management API"
= 62 characters
≈ 15-16 tokens
```

---

## Quick Start - Measuring Context Size

### Step 1: Install Dependencies

```bash
npm ci
```

This will install `tiktoken`, a tokenizer library that provides accurate token counts similar to Claude's tokenizer.

### Step 2: Run Basic Measurement

```bash
npm run measure-context
```

**Expected Output**:
```
═══════════════════════════════════════════════════════════════════════════
📊 MCP CONTEXT SIZE ANALYSIS
═══════════════════════════════════════════════════════════════════════════

📈 Summary Statistics:
   Total Tokens:              33,126
   Total Characters:          202,618
   Number of Tools:           29
   Average Tokens per Tool:   1,142
   Token/Character Ratio:     0.16

🔝 Top 10 Largest Tools by Token Count:
────────────────────────────────────────────────────────────────────────────
   #  │ Tool Name                          │ Tokens │ Desc │ Schema
────────────────────────────────────────────────────────────────────────────
     1 │ patch-content-type-mapi            │  11460 │   35 │  11425
     2 │ add-content-type-mapi              │   7200 │   10 │   7190
     3 │ add-content-type-snippet-mapi      │   5447 │   11 │   5436
   ...
```

### Step 3: Run Detailed Analysis

For a complete breakdown of every tool:

```bash
npm run measure-context:detailed
```

This shows individual token counts for each tool's description and schema.

---

## Automated Testing

### Creating a Baseline

Before making changes, create a baseline to track improvements:

```bash
npm run measure-context:baseline
```

This saves the current state to `.context-baseline/baseline.json`.

**Recommendation**: Add `.context-baseline/` to `.gitignore` if you don't want to commit baselines.

### Comparing Against Baseline

After optimizing tool descriptions, compare with your baseline:

```bash
npm run measure-context:compare
```

**Example Output**:
```
📊 Comparison with Baseline:
────────────────────────────────────────────────────────────────────────────
   Baseline (1/15/2025, 10:30:45 AM):
      Total Tokens: 33,126
      Tool Count:   29

   Current:
      Total Tokens: 28,245
      Tool Count:   29

   Change:
      -4,881 tokens (-14.73%) ✅
────────────────────────────────────────────────────────────────────────────
```

### JSON Output for Scripts

For integration with other tools or scripts:

```bash
npm run measure-context:json
```

This outputs raw JSON data:
```json
{
  "totalTokens": 33126,
  "toolCount": 29,
  "averageTokensPerTool": 1142,
  "tools": [...],
  "largestTools": [...],
  "estimatedCharacters": 202618
}
```

---

## Testing in Claude Desktop vs Claude Code

### Are They Different?

**Short answer**: No, they receive the **same context**.

Both Claude Desktop and Claude Code use the **Model Context Protocol (MCP)** and receive identical tool definitions. The context size is determined by your MCP server, not the client.

However, testing experiences differ:

### Claude Desktop Testing

#### Setup

1. Configure your MCP server in `claude_desktop_config.json`:

**Location**:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Single-Tenant (STDIO)**:
```json
{
  "mcpServers": {
    "kontent-ai": {
      "command": "node",
      "args": [
        "C:/repositories/mcp-server/build/bin.js",
        "stdio"
      ],
      "env": {
        "KONTENT_API_KEY": "your-api-key",
        "KONTENT_ENVIRONMENT_ID": "your-env-id"
      }
    }
  }
}
```

**Multi-Tenant (HTTP)** (recommended for testing):
```json
{
  "mcpServers": {
    "kontent-ai": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:3001/your-env-id/mcp",
        "--header",
        "Authorization: Bearer your-api-key"
      ]
    }
  }
}
```

#### Testing Steps

1. **Start your MCP server** (if using HTTP mode):
   ```bash
   npm run dev:shttp
   ```

2. **Restart Claude Desktop** to reload config

3. **Open Claude Desktop** and look for the 🔨 (hammer) icon in the input box

4. **Click the hammer icon** to see available tools

5. **Visual Inspection**:
   - Count how many tools are listed
   - Check if descriptions are clear and concise
   - Note any unnecessarily long descriptions

6. **Functional Testing**:
   ```
   You: "Use get-initial-context to start"
   Claude: [Calls the tool...]

   You: "List all content types"
   Claude: [Should use list-content-types-mapi...]
   ```

#### What You Can Observe:

- ✅ Tool availability (hammer icon)
- ✅ Tool names and descriptions (when hovering/selecting)
- ✅ Tool invocation (when Claude uses them)
- ❌ **Cannot directly see token count** (use measurement script)

### Claude Code Testing

#### Setup

Configure your MCP server in Claude Code settings:

**Option 1: Via CLI**:
```bash
# STDIO mode
claude mcp add \
  --command "node" \
  --args "C:/repositories/mcp-server/build/bin.js" "stdio" \
  --env "KONTENT_API_KEY=your-key" \
  --env "KONTENT_ENVIRONMENT_ID=your-env-id" \
  kontent-ai

# HTTP mode
claude mcp add \
  --url "http://localhost:3001/your-env-id/mcp" \
  --header "Authorization: Bearer your-api-key" \
  kontent-ai
```

**Option 2: Edit Settings File Directly**:

Location: `~/.config/claude/mcp_settings.json` (or OS-specific config directory)

```json
{
  "mcpServers": {
    "kontent-ai": {
      "command": "node",
      "args": ["C:/repositories/mcp-server/build/bin.js", "stdio"],
      "env": {
        "KONTENT_API_KEY": "your-key",
        "KONTENT_ENVIRONMENT_ID": "your-env-id"
      }
    }
  }
}
```

#### Testing Steps

1. **Start MCP server** (if using HTTP):
   ```bash
   npm run dev:shttp
   ```

2. **Restart Claude Code** or reload MCP servers:
   ```bash
   claude mcp reload
   ```

3. **Check MCP server status**:
   ```bash
   claude mcp list
   ```

4. **Use the /mcp command** in Claude Code:
   ```
   /mcp kontent-ai
   ```

5. **Test tool invocation**:
   ```
   You: "Use get-initial-context"
   Claude: [Uses the tool...]
   ```

#### What You Can Observe:

- ✅ MCP server connection status
- ✅ Tool availability and usage
- ✅ Tool invocation logs
- ❌ **Cannot directly see token count** (use measurement script)

### Key Takeaway

**Both platforms receive identical context**. The measurement script (`npm run measure-context`) gives you the actual token count, regardless of which client you test with.

---

## Optimization Strategies

Based on the analysis output, focus on tools with the highest token counts.

### Strategy 1: Shorten Tool Descriptions

**Before**:
```typescript
"🚨 MANDATORY FIRST STEP: This tool MUST be called before using ANY other tools. It provides essential context, configuration, and operational guidelines for Kontent.ai. If you have not called this tool, do so immediately before proceeding with any other operation."
```
(210 characters, ~52 tokens)

**After**:
```typescript
"Get initial context required before any other operation"
```
(57 characters, ~14 tokens)

**Savings**: ~38 tokens per call

### Strategy 2: Remove Redundant Information

**Before**:
```typescript
"Get Kontent.ai content type by internal ID from Management API"
```

**After** (if "Kontent.ai" and "Management API" are clear from context):
```typescript
"Get content type by ID"
```

**Savings**: ~8-10 tokens

### Strategy 3: Simplify Schema Descriptions

**Before**:
```typescript
codename: z.string().optional().describe(
  "Codename of the content type (optional, will be generated if not provided)"
)
```
(75 characters, ~18 tokens)

**After**:
```typescript
codename: z.string().optional().describe("Codename (auto-generated if empty)")
```
(44 characters, ~11 tokens)

**Savings**: ~7 tokens per field

### Strategy 4: Remove Obvious Descriptions

**Before**:
```typescript
name: z.string().describe("Display name of the content type")
```

**After** (parameter name is self-explanatory):
```typescript
name: z.string().describe("Display name")
```

Or even:
```typescript
name: z.string()  // No description needed
```

### Strategy 5: Use Abbreviations

**Before**:
```typescript
"from Management API"
"via Management API"
```

**After**:
```typescript
"(MAPI)"
// Or remove entirely if the -mapi suffix makes it clear
```

### Measuring Impact

After each optimization:

1. **Measure new context size**:
   ```bash
   npm run measure-context
   ```

2. **Compare with baseline**:
   ```bash
   npm run measure-context:compare
   ```

3. **Test functionality** in Claude Desktop or Claude Code to ensure descriptions are still clear enough for the LLM

---

## CI/CD Integration

### GitHub Actions Example

Add to `.github/workflows/context-size-check.yml`:

```yaml
name: MCP Context Size Check

on:
  pull_request:
    paths:
      - 'src/tools/**'
      - 'src/schemas/**'
      - 'src/server.ts'
  push:
    branches:
      - main

jobs:
  check-context-size:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Measure context size
        run: |
          npm run measure-context:json > context-report.json

      - name: Check context size limit
        run: |
          TOKENS=$(node -p "require('./context-report.json').totalTokens")
          echo "Total tokens: $TOKENS"

          if [ $TOKENS -gt 35000 ]; then
            echo "❌ Context size ($TOKENS tokens) exceeds 35,000 token limit!"
            exit 1
          elif [ $TOKENS -gt 30000 ]; then
            echo "⚠️  Context size ($TOKENS tokens) is high. Consider optimizing."
          else
            echo "✅ Context size is within acceptable limits."
          fi

      - name: Upload context report
        uses: actions/upload-artifact@v4
        with:
          name: context-size-report
          path: context-report.json
```

### Pre-commit Hook Example

Add to `.husky/pre-commit` or `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Check if tool files have changed
if git diff --cached --name-only | grep -qE 'src/tools/|src/schemas/|src/server.ts'; then
  echo "🔍 Measuring MCP context size..."
  npm run measure-context

  echo ""
  echo "ℹ️  If context size is too large, consider optimizing tool descriptions."
  echo ""
fi
```

---

## Troubleshooting

### Issue: "Cannot access tools directly"

**Symptom**: The measurement script shows a warning about not being able to access tools.

**Solution**: This is expected if the MCP SDK's internal structure changes. The script has fallback methods. If the measurement still fails, check the SDK documentation for the correct way to list tools.

### Issue: Token count seems inaccurate

**Symptom**: Token count doesn't match what you expect based on character count.

**Explanation**: Tokenizers split text differently than simple character counting:
- Common words: 1 token = 1 word (e.g., "the", "is", "get")
- Complex words: 1 token = part of a word (e.g., "Management" = 2 tokens)
- Special characters: Can be separate tokens

**Solution**: Use the measurement script which uses `tiktoken`, a production-grade tokenizer.

### Issue: Context size varies between platforms

**Symptom**: Context seems different in Claude Desktop vs Claude Code.

**Solution**: The context size is the same; the *experience* may feel different:
- Claude Desktop: Visual UI may make it seem like more/less context
- Claude Code: CLI may give different perception

Use `npm run measure-context` for ground truth.

### Issue: Need to measure context of a specific tool

**Symptom**: Want to know token count of just one tool before/after changes.

**Solution**: Use the detailed output and grep:

```bash
npm run measure-context:detailed | grep -A 4 "tool-name"
```

Or modify the script to accept a tool name filter.

---

## Example: Complete Optimization Workflow

### Step 1: Establish Baseline

```bash
# Measure current state
npm run measure-context:baseline
```

Output:
```
Total Tokens: 33,126
✅ Baseline saved to .context-baseline/baseline.json
```

### Step 2: Identify Top Offenders

```bash
npm run measure-context
```

Output shows:
```
🔝 Top 10 Largest Tools:
1. add-content-type-mapi       │  3,245 tokens
2. patch-content-type-mapi     │  2,987 tokens
3. upsert-language-variant     │  2,134 tokens
```

### Step 3: Optimize Descriptions

Edit `src/tools/add-content-type-mapi.ts`:

**Before**:
```typescript
"Add new Kontent.ai content type via Management API"
```

**After**:
```typescript
"Add content type"
```

Edit schemas to remove verbose descriptions.

### Step 4: Measure Impact

```bash
npm run measure-context:compare
```

Output:
```
Change: -10,911 tokens (-25.89%) ✅
```

### Step 5: Test Functionality

Test in Claude Desktop:
```
You: "Create a new content type called Article with title and body fields"
Claude: [Uses add-content-type-mapi successfully]
```

### Step 6: Commit Changes

```bash
git add src/tools/
git commit -m "Optimize tool descriptions - reduce context by 26%"
```

---

## Summary

### Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm run measure-context` | Basic measurement |
| `npm run measure-context:detailed` | Full breakdown |
| `npm run measure-context:json` | JSON output for scripts |
| `npm run measure-context:baseline` | Save current state |
| `npm run measure-context:compare` | Compare with baseline |

### Key Metrics

- **Current Baseline**: 33,126 tokens
- **Target**: < 30,000 tokens
- **Optimal**: < 25,000 tokens

### Testing Platforms

- **Claude Desktop**: Visual UI, tool hammer icon
- **Claude Code**: CLI-based, `/mcp` command
- **Both receive identical context** from your MCP server

### Optimization Priorities

1. Focus on top 10 largest tools first
2. Shorten tool descriptions (biggest impact)
3. Simplify schema `.describe()` text
4. Remove redundant information
5. Test that LLM can still use tools effectively

---

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Anthropic Claude API - Token Counting](https://docs.anthropic.com/claude/docs/token-counting)
- [Tiktoken (OpenAI Tokenizer)](https://github.com/openai/tiktoken)
- Project-specific: `CLAUDE.md` for development guidelines

---

**Last Updated**: January 2025
**Maintained By**: Kontent.ai MCP Server Team
