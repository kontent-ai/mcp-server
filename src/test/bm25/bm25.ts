import MiniSearch from "minisearch";

export interface ToolDocument {
  id: number;
  name: string;
  description: string;
  args: string;
}

export interface SearchResult {
  name: string;
  score: number;
}

/**
 * Extracts argument names and descriptions from a Zod input schema
 * to produce a searchable string, matching Anthropic's BM25 tool search
 * which indexes argument names and argument descriptions.
 */
const extractArgs = (inputSchema: Record<string, unknown>): string => {
  const parts: string[] = [];
  for (const [argName, zodType] of Object.entries(inputSchema)) {
    parts.push(argName);
    const desc = (zodType as { description?: string }).description;
    if (desc) parts.push(desc);
  }
  return parts.join(" ");
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);

interface ToolLike {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
}

export const createToolSearchIndex = (
  tools: ReadonlyArray<ToolLike>,
): MiniSearch<ToolDocument> => {
  const docs: ReadonlyArray<ToolDocument> = tools.map((t, i) => ({
    id: i,
    name: t.name,
    description: t.description,
    args: extractArgs(t.inputSchema),
  }));

  const index = new MiniSearch<ToolDocument>({
    fields: ["name", "description", "args"],
    storeFields: ["name"],
    tokenize,
    searchOptions: {
      boost: { name: 2, args: 0.5 },
      prefix: true,
    },
  });

  index.addAll(docs as ToolDocument[]);
  return index;
};

export const searchTools = (
  index: MiniSearch<ToolDocument>,
  query: string,
  topK: number,
): ReadonlyArray<SearchResult> =>
  index
    .search(query)
    .slice(0, topK)
    .map((r) => ({
      name: r.name as string,
      score: r.score,
    }));
