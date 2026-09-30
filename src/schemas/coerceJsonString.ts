import { z } from "zod";

const excerptRadius = 20;

/**
 * Builds the validation message for a JSON string that could not be parsed:
 * the parser's own reason, and the text around the failing position when the
 * parser names one (`... in JSON at position N`). The traces behind EN-901
 * show the usual defect is one unescaped `"` inside a value, which the model
 * cannot find from "expected array, received string" alone.
 */
const describeParseFailure = (value: string, error: unknown): string => {
  const reason = error instanceof Error ? error.message : String(error);
  const position = /at position (\d+)/.exec(reason)?.[1];
  const near =
    position === undefined
      ? ""
      : ` Near: …${value
          .slice(
            Math.max(0, Number(position) - excerptRadius),
            Number(position) + excerptRadius,
          )
          .replace(/\s+/g, " ")}…`;
  return `Sent as a JSON string that could not be parsed: ${reason}.${near} Send the array or object directly (not as a string), or escape double quotes inside string values.`;
};

/**
 * Wraps a Zod schema so a JSON-stringified value is parsed before validation.
 *
 * LLM clients sometimes emit a complex array/object argument as a JSON-encoded
 * string (e.g. `"elements": "[{...}]"` instead of `"elements": [{...}]`), which
 * otherwise fails validation with "expected array, received string" (EN-785).
 * When the incoming value is a string we attempt to parse it; on parse failure
 * a validation issue names the parser's reason and the failing position, so
 * the model can fix the one broken character instead of regenerating the whole
 * value (EN-901). The issue stops the pipe, so the inner type error is not
 * reported on top of it.
 *
 * Only the input side is transformed — the JSON Schema published to clients via
 * `tools/list` is unchanged because the MCP SDK converts schemas with
 * `pipeStrategy: "input"`, which emits the inner schema. Keep `.describe()` /
 * `.min()` on the inner schema and `.optional()` on the result of this wrapper.
 *
 * Applied at the top-level tool parameter layer only (the whole arg an LLM
 * emits as one blob), and only to array/object parameters: a plain string is
 * never a valid value for a wrapped parameter. Nested array/object fields are
 * intentionally not wrapped.
 */
export const coerceJsonString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value, ctx) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        ctx.addIssue(describeParseFailure(value, error));
        return value;
      }
    }
    return value;
  }, schema);
