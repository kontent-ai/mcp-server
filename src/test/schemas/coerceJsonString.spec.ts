import * as assert from "node:assert";
import { describe, it } from "mocha";
import { z } from "zod";
import { bulkGetItemsWithVariantsSchema } from "../../schemas/bulkGetItemsWithVariantsSchemas.js";
import { coerceJsonString } from "../../schemas/coerceJsonString.js";
import { createContentType } from "../../tools/create-content-type.js";
import { updateContentItemVariant } from "../../tools/update-content-item-variant.js";

describe("coerceJsonString", () => {
  const schema = z.object({
    items: coerceJsonString(
      z
        .array(z.object({ a: z.string() }))
        .min(1)
        .describe("items array"),
    ),
    opt: coerceJsonString(z.array(z.string())).optional(),
  });

  describe("runtime coercion", () => {
    it("parses a JSON-stringified array (the EN-785 case)", () => {
      const result = schema.safeParse({ items: '[{"a":"x"}]' });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.deepStrictEqual(result.data.items, [{ a: "x" }]);
      }
    });

    it("accepts a native array unchanged", () => {
      const result = schema.safeParse({ items: [{ a: "x" }] });
      assert.strictEqual(result.success, true);
    });

    it("names the JSON parse failure for a non-JSON string (EN-901)", () => {
      const result = schema.safeParse({ items: "not json" });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        // The parse issue stops the pipe: no "expected array" issue on top.
        assert.strictEqual(result.error.issues.length, 1);
        const issue = result.error.issues[0];
        assert.strictEqual(issue.code, "custom");
        assert.deepStrictEqual(issue.path, ["items"]);
        assert.match(issue.message, /could not be parsed: .*not valid JSON/);
        assert.match(issue.message, /Send the array or object directly/);
      }
    });

    it("reports the position and the surrounding text for an unescaped quote", () => {
      // The EN-901 shape: valid JSON except one unescaped `"` inside a value.
      const value = '[{"a":"Řekl „ano" a odešel"}]';
      const result = schema.safeParse({ items: value });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const issue = result.error.issues[0];
        assert.strictEqual(issue.code, "custom");
        assert.match(issue.message, /at position \d+/);
        assert.match(issue.message, /Near: …/);
        assert.ok(
          issue.message.includes('ano" a ode'),
          `excerpt missing in: ${issue.message}`,
        );
      }
    });

    it("rejects a string that parses to the wrong type with the type error", () => {
      // Valid JSON, but an object — not the expected array.
      const result = schema.safeParse({ items: '{"a":"x"}' });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const issue = result.error.issues[0];
        assert.strictEqual(issue.code, "invalid_type");
        assert.strictEqual((issue as { expected?: string }).expected, "array");
      }
    });

    it("parses a JSON scalar string and reports the array type error, not a parse error", () => {
      // "42" is valid JSON, so the pipe continues into the inner schema.
      const result = schema.safeParse({ items: "42" });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const issue = result.error.issues[0];
        assert.strictEqual(issue.code, "invalid_type");
        assert.strictEqual((issue as { expected?: string }).expected, "array");
        assert.ok(!issue.message.includes("could not be parsed"));
      }
    });

    it("enforces inner constraints (min) after parsing", () => {
      const result = schema.safeParse({ items: "[]" });
      assert.strictEqual(result.success, false);
    });

    it("keeps optional wrapped params optional", () => {
      const result = schema.safeParse({ items: [{ a: "x" }] });
      assert.strictEqual(result.success, true);
    });

    it("coerces an optional wrapped param when present as a string", () => {
      const result = schema.safeParse({ items: [{ a: "x" }], opt: '["y"]' });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.deepStrictEqual(result.data.opt, ["y"]);
      }
    });
  });

  // Guards that wrapping a param does NOT change the JSON Schema published to
  // clients. The MCP SDK converts schemas with io/pipeStrategy "input", which
  // emits the inner schema; this asserts that contract for the installed Zod.
  describe("published JSON Schema (io: input)", () => {
    it("advertises a wrapped required param as an array, preserving items/min/description", () => {
      const json = z.toJSONSchema(schema, { io: "input" }) as {
        properties: Record<string, Record<string, unknown>>;
        required?: string[];
      };
      assert.strictEqual(json.properties.items.type, "array");
      assert.ok(json.properties.items.items, "items schema preserved");
      assert.strictEqual(json.properties.items.minItems, 1);
      assert.strictEqual(json.properties.items.description, "items array");
      assert.ok(json.required?.includes("items"));
    });

    it("keeps a wrapped optional param out of required", () => {
      const json = z.toJSONSchema(schema, { io: "input" }) as {
        required?: string[];
      };
      assert.ok(!(json.required ?? []).includes("opt"));
    });
  });

  // Same guarantees on the real tool that triggered EN-785.
  describe("real tool input schemas", () => {
    it("update-content-item-variant still advertises elements as a required array", () => {
      const json = z.toJSONSchema(
        z.object(updateContentItemVariant.inputSchema),
        { io: "input" },
      ) as {
        properties: Record<string, Record<string, unknown>>;
        required?: string[];
      };
      assert.strictEqual(json.properties.elements.type, "array");
      assert.ok(
        json.properties.elements.items,
        "elements items schema preserved",
      );
      assert.ok(json.required?.includes("elements"));
      assert.strictEqual(typeof json.properties.elements.description, "string");
    });

    it("create-content-type keeps content_groups optional and elements required", () => {
      const json = z.toJSONSchema(z.object(createContentType.inputSchema), {
        io: "input",
      }) as {
        properties: Record<string, Record<string, unknown>>;
        required?: string[];
      };
      assert.strictEqual(json.properties.elements.type, "array");
      assert.strictEqual(json.properties.content_groups.type, "array");
      assert.ok(json.required?.includes("elements"));
      assert.ok(!(json.required ?? []).includes("content_groups"));
    });
  });

  // Read-only tools' top-level array/object params are wrapped too.
  describe("read-only top-level params", () => {
    it("parses a stringified `variants` array (bulk-get)", () => {
      const result = bulkGetItemsWithVariantsSchema.safeParse({
        variants: JSON.stringify([
          {
            item: { id: "11111111-1111-1111-1111-111111111111" },
            language: { id: "22222222-2222-2222-2222-222222222222" },
          },
        ]),
      });
      assert.strictEqual(
        result.success,
        true,
        result.success ? "" : JSON.stringify(result.error.issues),
      );
    });
  });
});
