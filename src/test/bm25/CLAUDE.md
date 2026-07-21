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

- **No separate fixture file** — tests import `allTools` (an object of all tool definitions) from `src/tools/index.ts`. Tool definitions are the single source of truth. Test expectations reference tools as `allTools.toolName.name` instead of hardcoded strings, so renames are caught at compile time.
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
import { allTools } from './build/tools/index.js';
import { createToolSearchIndex, searchTools } from './build/test/bm25/bm25.js';
const index = createToolSearchIndex(Object.values(allTools));
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

## Two description anti-patterns that silently hurt discoverability

BM25 has no concept of negation or reference — it only sees tokens. These two patterns read
fine to a human but actively work against the tool they're trying to help, and the existing
`npm test` assertions (inclusion in top 5) won't always catch them — see the note at the end of
this section.

**1. Negative-form phrasing that repeats another tool's keywords.** Writing "not the
current/latest draft" or "only, not full content" still adds the tokens "draft"/"full content"
as positive relevance signal to *this* tool's document — BM25 has no way to apply the "not".
That can let a tool outrank the one that should actually own those terms for a plain query,
even though it returns the opposite of what the query is asking for. This happened for real:
`get-published-content-item-variant-version` said "not the current/latest draft", which let it
outrank `get-content-item-variant` for the query "get current draft variant" (77 vs 73 points)
— the published-version tool won a query asking for exactly what it doesn't return. Fix: describe
what the tool *does*, not what it isn't (e.g. "...exactly as served on the Delivery API right
now, even when a newer draft version exists").

**2. Embedding another tool's literal hyphenated name as a cross-reference.** Writing
`` `...resolve several candidate IDs in one call with ${bulkGetContentItemVariantsToolName}
instead` `` duplicates every token of that other tool's name into *this* tool's own document.
When several tools all do this for the same target, the target competes against — and can lose
to — its own callers for its own plain-name query. This happened for real: five tools
(`get-content-item`, `get-content-item-variant`, `get-content-item-translations`,
`list-content-item-variants`, `search-content-item-variants`) all name-dropped
`bulk-get-content-item-variants` in their descriptions, and a live agent run burned 3-4 search
attempts on plain queries like "bulk get content item variants" before giving up and calling a
single-item tool in a loop instead (which every one of those descriptions explicitly says not to
do — see anti-pattern 1). Fix: state the behavior directly instead of naming another tool
(`Returns lightweight references, not full content` → `Returns lightweight ... references for
further lookup`, dropping the literal name). If a behavioral preference needs to apply broadly
(e.g. "prefer a single batch call over calling a single-item tool in a loop"), put it once in
the agent's system prompt (`ai-agent` repo, `src/copilot/conversation/prompts.ts`) instead of
repeating a tool name in every related description.

**Both anti-patterns can pass `npm test` while still being broken**, because the test assertions
only check that the expected tool appears somewhere in the top 5 — not that it out-ranks a tool
that shouldn't win. A tool can keep passing its own test while silently losing rank to another
tool's document. After any description change (yours or one you're reviewing), run the debug
script from "Debugging a failing test" above for a few plausible real queries and actually look
at the score gap to the runner-up, not just whether your target is present.

## Adding a new tool

1. Create the tool file using one of the factories in `src/tools/toolDefinition.ts`, by what it does to the environment:
   - `defineReadOnlyTool` — gets, lists, searches (no mutation)
   - `defineAdditiveTool` — creates that only add, never overwrite/remove (`add*` create tools)
   - `defineDestructiveTool` — updates, patches, deletes, publishes/unpublishes, upserts (anything that may overwrite or remove)
2. Add it to `src/tools/index.ts` (import and add to `allTools` object)
3. Add a new `TestGroup` or extend an existing one in `toolSearchBm25.spec.ts` with cases covering:
   - Action verb variations: create/add/new, get/retrieve/fetch, delete/remove, modify/patch/edit/update, list/all
   - Domain synonyms relevant to the tool (e.g. model/schema, categories/tags)
4. Run `npm test` and iterate — if the tool doesn't rank in top 5, improve its description using the patterns above

## Modifying a tool name or description

1. Update the tool source file in `src/tools/<tool>.ts`
2. Run `npm test` to verify the change doesn't break BM25 search rankings for other tools
3. If a BM25 test fails, improve the description rather than weakening the test expectation

## Removing a tool

1. Remove the tool file and its import/entry in `src/tools/index.ts`
2. Remove all related test cases from the `testGroups` array in `toolSearchBm25.spec.ts`
3. Run `npm test` to verify no ripple effects on other tool rankings (removing a tool changes IDF scores for shared terms)

## Adding a new test case

Add a `{ query, expected }` entry to the appropriate group in the `testGroups` array. Write queries as a Claude agent would generate them — short (2-5 words), action-oriented, using the key entity name and verb. Don't keyword-stuff or tailor the query to match the description. If the test fails, that's a signal the description needs improvement.
