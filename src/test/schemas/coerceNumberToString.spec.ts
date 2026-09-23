import * as assert from "node:assert";
import { describe, it } from "mocha";
import { z } from "zod";
import { coerceNumberToString } from "../../schemas/coerceNumberToString.js";
import { filterVariantsSchema } from "../../schemas/filterVariantSchemas.js";
import { searchOperationSchema } from "../../schemas/searchOperationSchemas.js";
import { createContentItem } from "../../tools/create-content-item.js";

describe("coerceNumberToString", () => {
  const schema = z.object({
    phrase: coerceNumberToString(z.string().describe("a phrase")).optional(),
  });

  describe("runtime coercion", () => {
    it("turns a number into its decimal text (the EN-901 search_phrase case)", () => {
      const result = schema.safeParse({ phrase: 300000 });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.phrase, "300000");
      }
    });

    it("keeps a string unchanged", () => {
      const result = schema.safeParse({ phrase: "300.000" });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.phrase, "300.000");
      }
    });

    it("keeps the wrapped param optional", () => {
      const result = schema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it("still rejects other types with the string type error", () => {
      const result = schema.safeParse({ phrase: true });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const issue = result.error.issues[0];
        assert.strictEqual(issue.code, "invalid_type");
        assert.strictEqual((issue as { expected?: string }).expected, "string");
        assert.deepStrictEqual(issue.path, ["phrase"]);
      }
    });
  });

  it("carries the inner description on the wrapper itself", () => {
    // Read by tooling that looks at the top-level Zod object (BM25 tests).
    assert.strictEqual(
      coerceNumberToString(z.string().describe("a phrase")).description,
      "a phrase",
    );
    assert.strictEqual(coerceNumberToString(z.string()).description, undefined);
  });

  // Guards that wrapping a param does NOT change the JSON Schema published to
  // clients: the model is still asked for a string.
  describe("published JSON Schema (io: input)", () => {
    it("advertises the wrapped param as a string with its description, not required", () => {
      const json = z.toJSONSchema(schema, { io: "input" }) as {
        properties: Record<string, Record<string, unknown>>;
        required?: string[];
      };
      assert.strictEqual(json.properties.phrase.type, "string");
      assert.strictEqual(json.properties.phrase.description, "a phrase");
      assert.ok(!(json.required ?? []).includes("phrase"));
    });
  });

  describe("real tool input schemas", () => {
    const languageId = "00000000-0000-0000-0000-000000000000";

    it("the variant filter accepts a numeric search_phrase", () => {
      const result = filterVariantsSchema.safeParse({
        search_phrase: 300,
        language: { id: languageId },
      });
      assert.strictEqual(
        result.success,
        true,
        result.success ? "" : JSON.stringify(result.error.issues),
      );
      if (result.success) {
        assert.strictEqual(result.data.search_phrase, "300");
      }
    });

    it("the variant filter still advertises search_phrase as a string", () => {
      const json = z.toJSONSchema(filterVariantsSchema, { io: "input" }) as {
        properties: Record<string, Record<string, unknown>>;
      };
      assert.strictEqual(json.properties.search_phrase.type, "string");
      assert.strictEqual(
        typeof json.properties.search_phrase.description,
        "string",
      );
    });

    it("the AI search accepts a numeric searchPhrase", () => {
      const result = searchOperationSchema.safeParse({
        searchPhrase: 300,
        filter: { variantId: languageId },
      });
      assert.strictEqual(
        result.success,
        true,
        result.success ? "" : JSON.stringify(result.error.issues),
      );
      if (result.success) {
        assert.strictEqual(result.data.searchPhrase, "300");
      }
    });

    it("the AI search still requires searchPhrase and advertises it as a string", () => {
      const json = z.toJSONSchema(searchOperationSchema, { io: "input" }) as {
        properties: Record<string, Record<string, unknown>>;
        required?: string[];
      };
      assert.strictEqual(json.properties.searchPhrase.type, "string");
      assert.ok(json.required?.includes("searchPhrase"));
      assert.strictEqual(
        searchOperationSchema.safeParse({ filter: { variantId: languageId } })
          .success,
        false,
      );
    });

    it("create-content-item accepts a numeric codename", () => {
      const result = z.object(createContentItem.inputSchema).safeParse({
        name: "Article 2024",
        type: { id: "11111111-1111-1111-1111-111111111111" },
        codename: 2024,
      });
      assert.strictEqual(
        result.success,
        true,
        result.success ? "" : JSON.stringify(result.error.issues),
      );
      if (result.success) {
        assert.strictEqual(result.data.codename, "2024");
      }
    });

    it("create-content-item still advertises codename as an optional string", () => {
      const json = z.toJSONSchema(z.object(createContentItem.inputSchema), {
        io: "input",
      }) as {
        properties: Record<string, Record<string, unknown>>;
        required?: string[];
      };
      assert.strictEqual(json.properties.codename.type, "string");
      assert.strictEqual(
        json.properties.codename.description,
        "Codename (auto-generated if omitted)",
      );
      assert.ok(!(json.required ?? []).includes("codename"));
    });
  });
});
