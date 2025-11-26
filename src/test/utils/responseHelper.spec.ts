import * as assert from "node:assert";
import { describe, it } from "mocha";
import {
  createMcpToolSuccessResponse,
  createVariantMcpToolSuccessResponse,
  isEmptyOrDefault,
  removeEmptyElementsFromVariant,
  removeEmptyValues,
} from "../../utils/responseHelper.js";

describe("isEmptyOrDefault", () => {
  describe("should return true for empty/default values", () => {
    it("returns true for null", () => {
      assert.strictEqual(isEmptyOrDefault(null), true);
    });

    it("returns true for undefined", () => {
      assert.strictEqual(isEmptyOrDefault(undefined), true);
    });

    it("returns true for empty string", () => {
      assert.strictEqual(isEmptyOrDefault(""), true);
    });

    it("returns true for rich text empty paragraph", () => {
      assert.strictEqual(isEmptyOrDefault("<p><br/></p>"), true);
    });

    it("returns true for empty array", () => {
      assert.strictEqual(isEmptyOrDefault([]), true);
    });

    it("returns true for empty object", () => {
      assert.strictEqual(isEmptyOrDefault({}), true);
    });
  });

  describe("should return false for non-empty values", () => {
    it("returns false for non-empty string", () => {
      assert.strictEqual(isEmptyOrDefault("hello"), false);
    });

    it("returns false for number zero", () => {
      assert.strictEqual(isEmptyOrDefault(0), false);
    });

    it("returns false for positive number", () => {
      assert.strictEqual(isEmptyOrDefault(42), false);
    });

    it("returns false for boolean false", () => {
      assert.strictEqual(isEmptyOrDefault(false), false);
    });

    it("returns false for boolean true", () => {
      assert.strictEqual(isEmptyOrDefault(true), false);
    });

    it("returns false for non-empty array", () => {
      assert.strictEqual(isEmptyOrDefault([1, 2, 3]), false);
    });

    it("returns false for non-empty object", () => {
      assert.strictEqual(isEmptyOrDefault({ key: "value" }), false);
    });

    it("returns false for Date object", () => {
      assert.strictEqual(isEmptyOrDefault(new Date()), false);
    });

    it("returns false for rich text with actual content", () => {
      assert.strictEqual(isEmptyOrDefault("<p>Hello world</p>"), false);
    });
  });
});

describe("removeEmptyValues", () => {
  describe("primitive values", () => {
    it("returns undefined for null", () => {
      assert.strictEqual(removeEmptyValues(null), undefined);
    });

    it("returns undefined for undefined", () => {
      assert.strictEqual(removeEmptyValues(undefined), undefined);
    });

    it("returns undefined for empty string", () => {
      assert.strictEqual(removeEmptyValues(""), undefined);
    });

    it("returns undefined for rich text empty paragraph", () => {
      assert.strictEqual(removeEmptyValues("<p><br/></p>"), undefined);
    });

    it("preserves non-empty string", () => {
      assert.strictEqual(removeEmptyValues("hello"), "hello");
    });

    it("preserves number zero", () => {
      assert.strictEqual(removeEmptyValues(0), 0);
    });

    it("preserves boolean false", () => {
      assert.strictEqual(removeEmptyValues(false), false);
    });
  });

  describe("arrays", () => {
    it("returns undefined for empty array", () => {
      assert.strictEqual(removeEmptyValues([]), undefined);
    });

    it("removes empty values from array", () => {
      assert.deepStrictEqual(removeEmptyValues([1, null, 2, "", 3]), [1, 2, 3]);
    });

    it("returns undefined when all array items are empty", () => {
      assert.strictEqual(removeEmptyValues([null, "", [], {}]), undefined);
    });

    it("recursively cleans nested arrays", () => {
      assert.deepStrictEqual(removeEmptyValues([1, [2, null, 3], [null, ""]]), [
        1,
        [2, 3],
      ]);
    });
  });

  describe("objects", () => {
    it("returns undefined for empty object", () => {
      assert.strictEqual(removeEmptyValues({}), undefined);
    });

    it("removes null properties", () => {
      assert.deepStrictEqual(removeEmptyValues({ a: 1, b: null }), { a: 1 });
    });

    it("removes undefined properties", () => {
      assert.deepStrictEqual(removeEmptyValues({ a: 1, b: undefined }), {
        a: 1,
      });
    });

    it("removes empty string properties", () => {
      assert.deepStrictEqual(removeEmptyValues({ a: 1, b: "" }), { a: 1 });
    });

    it("removes empty array properties", () => {
      assert.deepStrictEqual(removeEmptyValues({ a: 1, b: [] }), { a: 1 });
    });

    it("removes empty object properties", () => {
      assert.deepStrictEqual(removeEmptyValues({ a: 1, b: {} }), { a: 1 });
    });

    it("removes rich text empty paragraph properties", () => {
      assert.deepStrictEqual(removeEmptyValues({ a: 1, b: "<p><br/></p>" }), {
        a: 1,
      });
    });

    it("returns undefined when all properties are empty", () => {
      assert.strictEqual(
        removeEmptyValues({ a: null, b: "", c: [], d: {} }),
        undefined,
      );
    });
  });

  describe("nested structures", () => {
    it("recursively cleans nested objects", () => {
      const input = {
        level1: {
          level2: {
            value: "keep",
            empty: null,
          },
          emptyObj: {},
        },
      };
      const expected = {
        level1: {
          level2: {
            value: "keep",
          },
        },
      };
      assert.deepStrictEqual(removeEmptyValues(input), expected);
    });

    it("removes nested objects that become empty after cleaning", () => {
      const input = {
        keep: "value",
        remove: {
          nested: {
            empty: null,
          },
        },
      };
      const expected = { keep: "value" };
      assert.deepStrictEqual(removeEmptyValues(input), expected);
    });

    it("handles deeply nested structures", () => {
      const input = {
        a: {
          b: {
            c: {
              d: {
                value: "deep",
                empty: "",
              },
            },
          },
        },
      };
      const expected = {
        a: {
          b: {
            c: {
              d: {
                value: "deep",
              },
            },
          },
        },
      };
      assert.deepStrictEqual(removeEmptyValues(input), expected);
    });
  });
});

describe("removeEmptyElementsFromVariant", () => {
  describe("non-object inputs", () => {
    it("returns null for null", () => {
      assert.strictEqual(removeEmptyElementsFromVariant(null), null);
    });

    it("returns undefined for undefined", () => {
      assert.strictEqual(removeEmptyElementsFromVariant(undefined), undefined);
    });

    it("returns primitive values unchanged", () => {
      assert.strictEqual(removeEmptyElementsFromVariant("string"), "string");
      assert.strictEqual(removeEmptyElementsFromVariant(42), 42);
      assert.strictEqual(removeEmptyElementsFromVariant(true), true);
    });
  });

  describe("elements array filtering", () => {
    it("removes elements with only element property", () => {
      const input = {
        elements: [{ element: { id: "id1" } }, { element: { id: "id2" } }],
      };
      const expected = {};
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });

    it("keeps elements with value property", () => {
      const input = {
        elements: [{ element: { id: "id1" }, value: "content" }],
      };
      const expected = {
        elements: [{ element: { id: "id1" }, value: "content" }],
      };
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });

    it("filters mixed elements array", () => {
      const input = {
        elements: [
          { element: { id: "id1" } },
          { element: { id: "id2" }, value: "keep" },
          { element: { id: "id3" } },
          { element: { id: "id4" }, components: [] },
        ],
      };
      const expected = {
        elements: [
          { element: { id: "id2" }, value: "keep" },
          { element: { id: "id4" }, components: [] },
        ],
      };
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });

    it("keeps non-object elements in elements array", () => {
      const input = {
        elements: ["string", 42, { element: { id: "id1" } }],
      };
      const expected = {
        elements: ["string", 42],
      };
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });
  });

  describe("nested structures", () => {
    it("processes nested objects with elements arrays", () => {
      const input = {
        item: {
          elements: [{ element: { id: "id1" } }],
        },
      };
      const expected = {
        item: {},
      };
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });

    it("processes arrays of objects with elements", () => {
      const input = {
        variants: [
          { elements: [{ element: { id: "id1" } }] },
          { elements: [{ element: { id: "id2" }, value: "keep" }] },
        ],
      };
      const expected = {
        variants: [
          {},
          { elements: [{ element: { id: "id2" }, value: "keep" }] },
        ],
      };
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });
  });

  describe("preserves other properties", () => {
    it("keeps non-elements properties unchanged", () => {
      const input = {
        id: "123",
        name: "Test",
        elements: [{ element: { id: "id1" } }],
      };
      const expected = {
        id: "123",
        name: "Test",
      };
      assert.deepStrictEqual(removeEmptyElementsFromVariant(input), expected);
    });
  });
});

describe("createMcpToolSuccessResponse", () => {
  it("returns correct structure", () => {
    const response = createMcpToolSuccessResponse({ key: "value" });
    assert.strictEqual(response.content.length, 1);
    assert.strictEqual(response.content[0].type, "text");
  });

  it("removes empty values from response data", () => {
    const input = {
      id: "123",
      name: null,
      value: "",
      items: [],
    };
    const response = createMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, { id: "123" });
  });

  it("handles complex nested data", () => {
    const input = {
      contentType: {
        id: "type-1",
        name: "Article",
        elements: [
          { id: "el-1", name: "Title", codename: "" },
          { id: "el-2", name: null, codename: "body" },
        ],
      },
    };
    const response = createMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, {
      contentType: {
        id: "type-1",
        name: "Article",
        elements: [
          { id: "el-1", name: "Title" },
          { id: "el-2", codename: "body" },
        ],
      },
    });
  });
});

describe("createVariantMcpToolSuccessResponse", () => {
  it("returns correct structure", () => {
    const response = createVariantMcpToolSuccessResponse({ key: "value" });
    assert.strictEqual(response.content.length, 1);
    assert.strictEqual(response.content[0].type, "text");
  });

  it("removes empty values and empty elements", () => {
    const input = {
      item: { id: "item-1" },
      language: { id: "lang-1" },
      elements: [
        { element: { id: "el-1" }, value: "" },
        { element: { id: "el-2" }, value: "content" },
        { element: { id: "el-3" }, value: null },
      ],
    };
    const response = createVariantMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, {
      item: { id: "item-1" },
      language: { id: "lang-1" },
      elements: [{ element: { id: "el-2" }, value: "content" }],
    });
  });

  it("removes elements array when all elements become empty", () => {
    const input = {
      item: { id: "item-1" },
      elements: [
        { element: { id: "el-1" }, value: "" },
        { element: { id: "el-2" }, value: null },
        { element: { id: "el-3" }, value: "<p><br/></p>" },
      ],
    };
    const response = createVariantMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, {
      item: { id: "item-1" },
    });
  });

  it("handles real-world variant response", () => {
    const input = {
      item: { id: "f4b3fc05-e988-4dae-9ac1-a94aba566474" },
      language: { id: "d1f95fde-af02-b3b5-bd9e-f232311ccab8" },
      last_modified: "2018-02-27T19:08:25.404Z",
      workflow: {
        workflow_identifier: { id: "00000000-0000-0000-0000-000000000000" },
        step_identifier: { id: "c199950d-99f0-4983-b711-6c4c91624b22" },
      },
      elements: [
        { element: { id: "text-id" }, value: "Article Title" },
        { element: { id: "rich-id" }, value: "<p><br/></p>", components: [] },
        { element: { id: "number-id" }, value: null },
        { element: { id: "assets-id" }, value: [] },
        { element: { id: "taxonomy-id" }, value: [] },
      ],
    };
    const response = createVariantMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, {
      item: { id: "f4b3fc05-e988-4dae-9ac1-a94aba566474" },
      language: { id: "d1f95fde-af02-b3b5-bd9e-f232311ccab8" },
      last_modified: "2018-02-27T19:08:25.404Z",
      workflow: {
        workflow_identifier: { id: "00000000-0000-0000-0000-000000000000" },
        step_identifier: { id: "c199950d-99f0-4983-b711-6c4c91624b22" },
      },
      elements: [{ element: { id: "text-id" }, value: "Article Title" }],
    });
  });

  it("handles variant with multiple variants (filter-variants response)", () => {
    const input = {
      variants: [
        {
          item: { id: "item-1" },
          elements: [
            { element: { id: "el-1" }, value: "" },
            { element: { id: "el-2" }, value: "content" },
          ],
        },
        {
          item: { id: "item-2" },
          elements: [
            { element: { id: "el-1" }, value: null },
            { element: { id: "el-2" }, value: [] },
          ],
        },
      ],
      pagination: {
        continuation_token: null,
        next_page: "",
      },
    };
    const response = createVariantMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, {
      variants: [
        {
          item: { id: "item-1" },
          elements: [{ element: { id: "el-2" }, value: "content" }],
        },
        {
          item: { id: "item-2" },
        },
      ],
    });
  });
});

describe("variant with all empty elements", () => {
  it("removes elements array entirely when all elements become empty", () => {
    const input = {
      elements: [
        { element: { id: "text-id" }, value: "" },
        { element: { id: "rich-id" }, value: "<p><br/></p>", components: [] },
        { element: { id: "number-id" }, value: null },
        { element: { id: "assets-id" }, value: [] },
      ],
    };

    const response = createVariantMcpToolSuccessResponse(input);
    const result = JSON.parse(response.content[0].text);

    assert.deepStrictEqual(
      result,
      {},
      "All empty elements should be removed, resulting in an empty object",
    );
  });
});
