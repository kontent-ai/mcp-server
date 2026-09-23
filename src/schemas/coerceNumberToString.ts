import { z } from "zod";

/**
 * Wraps a string schema so a JSON number is accepted and turned into its
 * decimal text before validation.
 *
 * LLM clients send identifier-like values that look numeric as numbers
 * (`"search_phrase": 300000`, `"codename": 2024`), which otherwise fails
 * validation with "expected string, received number" and is then retried
 * unchanged, sometimes many times in a row (EN-901). The text is what
 * `String()` produces, so digits the JSON number could not carry are already
 * gone when this runs (`300.000` arrives as `300`); the published schema
 * therefore still asks for a string and this only softens the failure.
 *
 * Only the input side is transformed — the JSON Schema published to clients via
 * `tools/list` is unchanged because the MCP SDK converts schemas with
 * `io: "input"`, which emits the inner schema. Keep `.describe()` on the inner
 * schema and `.optional()` on the result of this wrapper. The inner description
 * is copied onto the wrapper as well, so tooling that reads a parameter's
 * description off the top-level Zod object (the BM25 tool-search tests) still
 * sees it.
 */
export const coerceNumberToString = <T extends z.ZodString>(schema: T) => {
  const wrapped = z.preprocess(
    (value) =>
      typeof value === "number" && Number.isFinite(value)
        ? String(value)
        : value,
    schema,
  );
  return schema.description === undefined
    ? wrapped
    : wrapped.describe(schema.description);
};
