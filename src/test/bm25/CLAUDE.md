# BM25 Tool Search Tests

## What these tests do

These tests simulate how Anthropic's BM25 tool search (`tool_search_tool_bm25_20251119`) ranks our tools when Claude searches for them at runtime. When an MCP server has many tools, Anthropic's API uses BM25 ranking to surface the 3-5 most relevant tools per query instead of loading all tool definitions into context.

The tests use [MiniSearch](https://www.npmjs.com/package/minisearch) which implements BM25+ scoring. Matching Anthropic's behavior, the index searches tool names, descriptions, argument names, and argument descriptions — with name boosted 2x and args at 0.5x.

Each test asserts that for a given query, the expected tools appear in the top 5 results. This catches regressions where a description change accidentally makes a tool undiscoverable.

## How Claude generates search queries

Based on Anthropic's documentation and real-world testing:

- **Queries are short and keyword-based** (2-5 words), not full sentences
- Claude generates action-oriented phrases like `"create content type"`, `"publish variant"`, `"taxonomy"` — not `"I need to find a tool that creates content types"`
- The model extracts key entity names and action verbs from the user's request
- Queries do NOT contain filler words like "compliance filtering exact matching" — this is unrealistic

**Write test queries that match how an agent would actually search**, not keyword-stuffed strings designed to game the test. If a realistic short query fails, that's a signal to improve the tool description.

Reference: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool

## How it works

- **No separate fixture file** — tests import `allTools` directly from `src/server.ts`, which re-exports the tool definitions from each `src/tools/*.ts` file. Tool definitions are the single source of truth.
- `bm25.ts` — Wrapper around MiniSearch: indexes tool name (2x boost), description (1x), and argument names/descriptions (0.5x), with prefix matching enabled
- `toolSearchBm25.spec.ts` — Data-driven test cases generated from `TestGroup`/`TestCase` arrays

## Test structure

Tests are data-driven. Each test group covers one entity domain, and each case within it is a `{ query, expected }` pair:

```typescript
interface TestCase {
  readonly query: string;                        // Agent-style search query (2-5 words)
  readonly expected: ReadonlyArray<string>;       // Tool names that MUST appear in top 5
}

interface TestGroup {
  readonly name: string;                          // describe() block name
  readonly cases: ReadonlyArray<TestCase>;
}
```

A single loop generates all `describe`/`it` blocks from the `testGroups` array. Test names are auto-generated as `"query" -> [expected tools]`.

Each entity group includes **action verb variations** to ensure tools are discoverable regardless of phrasing:
- **create** / add / new
- **get** / retrieve / fetch
- **delete** / remove
- **modify** / patch / edit / update
- **list** / all / get (plural)

Plus **domain synonym variations** like content model/schema, categories/tags, localization/translations, language version/translation.

## Running

```bash
npm test
```

This builds and runs all tests including these. To run only BM25 tests:

```bash
npm run build && npx mocha --timeout 10s -- "build/test/bm25/**/*.spec.js"
```

## Debugging a failing test

A test fails when an expected tool drops out of the top 5 results. To diagnose:

```bash
npm run build && node --input-type=module -e "
import { allTools } from './build/server.js';
import { createToolSearchIndex, searchTools } from './build/test/bm25/bm25.js';
const index = createToolSearchIndex(allTools);
const results = searchTools(index, 'YOUR QUERY HERE', 10);
for (const [i, r] of results.entries()) console.log((i+1) + '.', r.name, '(score:', r.score.toFixed(2) + ')');
"
```

This shows the top 10 ranked tools with scores. Look for:

1. **Where the expected tool actually ranks** — if it's #6 or #7, a small description tweak fixes it. If it's #15+, the description needs significant work.
2. **What's displacing it** — often a tool with overlapping terms in its name (name tokens get 2x boost) or rich argument descriptions pushes the target tool down.

## Fixing a failing test

**Fix the tool description, not the test expectation.** The test expectations represent realistic agent queries. When a test fails, it means the tool's description isn't discoverable enough for BM25.

Common fixes:

- **Add the verb form agents actually use.** Agents search "translate content" but the description only had the noun "translation". Adding "translate content into a specific language" fixed it.
- **Use singular entity names, not just plural.** Query "content type" won't exact-match "content types" (only prefix-match). Adding singular "content type" mentions in the description boosted ranking.
- **Include synonym terms.** Agents search "get" but the description only said "List". Adding "Retrieve" helped. Agents say "fields" but we wrote "elements" — adding both helped.
- **Mention the workflow context.** "Publish" tool wasn't found for "workflow step" queries until the description mentioned "published workflow step".

After changing a description, just run `npm test` — descriptions are read directly from the tool source files, no fixture to sync.

## Adding a new tool

1. Create the tool file using `defineTool` (see `src/tools/toolDefinition.ts`)
2. Register it in `src/server.ts` (add to imports and `allTools` array)
3. Add a new `TestGroup` or extend an existing one in `toolSearchBm25.spec.ts` with cases covering:
   - Action verb variations: create/add/new, get/retrieve/fetch, delete/remove, modify/patch/edit/update, list/all
   - Domain synonyms relevant to the tool (e.g. model/schema, categories/tags)
4. Run `npm test` and iterate — if the tool doesn't rank in top 5, improve its description using the patterns above

## Modifying a tool name or description

1. Update the tool source file in `src/tools/<tool>.ts`
2. Run `npm test` to verify the change doesn't break BM25 search rankings for other tools
3. If a BM25 test fails, improve the description rather than weakening the test expectation

## Removing a tool

1. Remove the tool file and its import/entry in `src/server.ts`
2. Remove all related test cases from the `testGroups` array in `toolSearchBm25.spec.ts`
3. Run `npm test` to verify no ripple effects on other tool rankings (removing a tool changes IDF scores for shared terms)

## Adding a new test case

Add a `{ query, expected }` entry to the appropriate group in the `testGroups` array. Write queries as a Claude agent would generate them — short (2-5 words), action-oriented, using the key entity name and verb. Don't keyword-stuff or tailor the query to match the description. If the test fails, that's a signal the description needs improvement.
