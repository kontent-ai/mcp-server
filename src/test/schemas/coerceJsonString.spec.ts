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

    it("reports the real type error for a non-JSON string", () => {
      const result = schema.safeParse({ items: "not json" });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const issue = result.error.issues[0];
        assert.strictEqual(issue.code, "invalid_type");
        assert.strictEqual((issue as { expected?: string }).expected, "array");
        assert.deepStrictEqual(issue.path, ["items"]);
      }
    });

    it("rejects a string that parses to the wrong type", () => {
      // Valid JSON, but an object — not the expected array.
      const result = schema.safeParse({ items: '{"a":"x"}' });
      assert.strictEqual(result.success, false);
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
          { item: { id: "i" }, language: { id: "l" } },
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
