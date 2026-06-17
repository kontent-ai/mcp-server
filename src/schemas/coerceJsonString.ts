import { z } from "zod";

/**
 * Wraps a Zod schema so a JSON-stringified value is parsed before validation.
 *
 * LLM clients sometimes emit a complex array/object argument as a JSON-encoded
 * string (e.g. `"elements": "[{...}]"` instead of `"elements": [{...}]`), which
 * otherwise fails validation with "expected array, received string" (EN-785).
 * When the incoming value is a string we attempt to parse it; on parse failure
 * the original value is returned unchanged so Zod reports the real type error
 * instead of a misleading JSON error.
 *
 * Only the input side is transformed — the JSON Schema published to clients via
 * `tools/list` is unchanged because the MCP SDK converts schemas with
 * `pipeStrategy: "input"`, which emits the inner schema. Keep `.describe()` /
 * `.min()` on the inner schema and `.optional()` on the result of this wrapper.
 *
 * Applied at the top-level tool parameter layer only (the whole arg an LLM
 * emits as one blob). Nested array/object fields are intentionally not wrapped.
 */
export const coerceJsonString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }, schema);
