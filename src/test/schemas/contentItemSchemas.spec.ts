import * as assert from "node:assert";
import { describe, it } from "mocha";
import { languageVariantElementSchema } from "../../schemas/contentItemSchemas.js";

describe("languageVariantElementSchema", () => {
  describe("nested rich text components", () => {
    it("validates rich text element with deeply nested components", () => {
      const nestedRichTextElement = {
        element: { id: "1fefb369-53b9-4108-9ca3-837c99010c29" },
        value:
          '<p>rich1</p>\n<object type="application/kenticocloud" data-type="component" data-id="20a941ec-91bf-4a40-89c8-90b5e31dae27"></object>',
        components: [
          {
            id: "20a941ec-91bf-4a40-89c8-90b5e31dae27",
            type: { id: "da3871d1-f942-4d8c-b518-f4c6c97c5174" },
            elements: [
              {
                element: { id: "1fefb369-53b9-4108-9ca3-837c99010c29" },
                value:
                  '<p>rich2 nested</p>\n<object type="application/kenticocloud" data-type="component" data-id="5dd61cc6-d375-49d7-a8e3-e4dcd029be1a"></object>',
                components: [
                  {
                    id: "5dd61cc6-d375-49d7-a8e3-e4dcd029be1a",
                    type: { id: "da3871d1-f942-4d8c-b518-f4c6c97c5174" },
                    elements: [
                      {
                        value: "<p>rich3 nested nested</p>",
                        element: { id: "1fefb369-53b9-4108-9ca3-837c99010c29" },
                        components: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = languageVariantElementSchema.safeParse(
        nestedRichTextElement,
      );

      assert.strictEqual(
        result.success,
        true,
        `Schema validation failed: ${result.success ? "" : JSON.stringify(result.error.issues, null, 2)}`,
      );

      if (result.success) {
        assert.deepStrictEqual(
          result.data,
          nestedRichTextElement,
          "Parsed data should match input exactly",
        );
      }
    });

    it("validates rich text element with single level components", () => {
      const richTextElement = {
        element: { id: "1849f877-cd37-4ed0-8df6-3173748a126f" },
        value: "<p>Some content</p>",
        components: [
          {
            id: "af87f9d1-a448-489b-a5bd-9ab3e5e5f2e2",
            type: { id: "924daea8-5d87-4e7c-8c22-7b66044593c3" },
            elements: [
              {
                element: { id: "924daea8-5d87-4e7c-8c22-7b66044593c3" },
                value: "Nested value",
              },
            ],
          },
        ],
      };

      const result = languageVariantElementSchema.safeParse(richTextElement);

      assert.strictEqual(result.success, true);
    });

    it("validates rich text element with empty components array", () => {
      const richTextElement = {
        element: { id: "c0021332-250b-46d0-a283-c114c85f6062" },
        value: "<p>Some content</p>",
        components: [],
      };

      const result = languageVariantElementSchema.safeParse(richTextElement);

      assert.strictEqual(result.success, true);
    });

    it("validates rich text element with null components", () => {
      const richTextElement = {
        element: { id: "1ae5d294-5861-4555-881c-9279343443a5" },
        value: "<p>Some content</p>",
        components: null,
      };

      const result = languageVariantElementSchema.safeParse(richTextElement);

      assert.strictEqual(result.success, true);
    });
  });
});
