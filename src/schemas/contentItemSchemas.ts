import { z } from "zod";

// Define a reusable reference object schema
const referenceObjectSchema = z
  .object({
    id: z.string().optional(),
    codename: z.string().optional(),
    external_id: z.string().optional(),
  })
  .describe(
    "An object with an id, codename, or external_id property referencing another item. Using codename is preferred for better readability.",
  );

// Language variant element value schemas
const textElementValueSchema = z.object({
  value: z.string().describe("The text content of the element"),
});

const numberElementValueSchema = z.object({
  value: z.number().describe("The numeric value of the element"),
});

const dateTimeElementValueSchema = z.object({
  value: z
    .string()
    .nullable()
    .describe("The ISO-8601 formatted date-time string, or null for empty"),
});

const multipleChoiceElementValueSchema = z.object({
  value: z
    .array(referenceObjectSchema)
    .describe(
      "Array of references to the selected options by their codename or id",
    ),
});

const assetElementValueSchema = z.object({
  value: z
    .array(referenceObjectSchema)
    .describe("Array of references to assets by their codename or id"),
});

const modularContentElementValueSchema = z.object({
  value: z
    .array(referenceObjectSchema)
    .describe(
      "Array of references to linked content items by their codename or id",
    ),
});

const taxonomyElementValueSchema = z.object({
  value: z
    .array(referenceObjectSchema)
    .describe("Array of references to taxonomy terms by their codename or id"),
});

const richTextElementValueSchema = z.object({
  value: z
    .string()
    .describe(
      "The rich text content as a subset of HTML string format. Only specific HTML5 elements and attributes are supported as defined by Kontent.ai's rich text specification. See: https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#section/HTML5-elements-allowed-in-rich-text",
    ),
});

const urlSlugElementValueSchema = z.object({
  value: z.string().describe("The URL slug value"),
});

const customElementValueSchema = z.object({
  value: z.string().describe("The JSON string value for custom element"),
});

// Union type for all possible element values
const _elementValueSchema = z.discriminatedUnion("value", [
  textElementValueSchema,
  numberElementValueSchema,
  dateTimeElementValueSchema,
  multipleChoiceElementValueSchema,
  assetElementValueSchema,
  modularContentElementValueSchema,
  taxonomyElementValueSchema,
  richTextElementValueSchema,
  urlSlugElementValueSchema,
  customElementValueSchema,
]);

// Language variant element schema
const languageVariantElementSchema = z
  .record(
    z.string().describe("Element codename as key"),
    z
      .union([
        textElementValueSchema,
        numberElementValueSchema,
        dateTimeElementValueSchema,
        multipleChoiceElementValueSchema,
        assetElementValueSchema,
        modularContentElementValueSchema,
        taxonomyElementValueSchema,
        richTextElementValueSchema,
        urlSlugElementValueSchema,
        customElementValueSchema,
      ])
      .describe(
        "Element value object with 'value' property containing the element's content",
      ),
  )
  .describe(
    "Object where keys are element codenames and values are element value objects",
  );

// Collection reference schema
const collectionReferenceSchema = z
  .object({
    reference: referenceObjectSchema
      .nullable()
      .describe(
        "Reference to a collection by id, codename, or external_id. Use null to remove from collection.",
      ),
  })
  .describe("Collection assignment for the content item");

// Content item creation schema
export const contentItemCreateSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(200)
      .describe("Display name of the content item (1-200 characters)"),
    codename: z
      .string()
      .optional()
      .describe(
        "Codename of the content item (optional, will be generated from name if not provided)",
      ),
    type: referenceObjectSchema.describe(
      "Reference to the content type by id, codename, or external_id",
    ),
    external_id: z
      .string()
      .optional()
      .describe(
        "External ID for the content item (optional, useful for external system integration)",
      ),
    collection: collectionReferenceSchema
      .optional()
      .describe("Collection assignment for the content item (optional)"),
  })
  .describe("Schema for creating a new content item");

// Language variant creation/update schema
export const languageVariantUpsertSchema = z
  .object({
    elements: languageVariantElementSchema.describe(
      "Object containing element values for the language variant. Keys are element codenames, values are element value objects.",
    ),
    workflow_step: referenceObjectSchema
      .optional()
      .describe("Reference to workflow step by id or codename (optional)"),
  })
  .describe(
    "Schema for creating or updating a language variant of a content item",
  );

// Complete content item with language variant schema for convenience
export const contentItemWithVariantSchema = z
  .object({
    item: contentItemCreateSchema.describe("Content item data"),
    language_codename: z
      .string()
      .default("default")
      .describe(
        "Codename of the language for the variant (defaults to 'default')",
      ),
    variant: languageVariantUpsertSchema.describe(
      "Language variant data with element values",
    ),
  })
  .describe(
    "Schema for creating a content item along with its language variant in one operation",
  );

// Element value helper schemas for better LLM understanding
export const elementValueHelpers = {
  text: z
    .object({
      value: z.string().describe("Text content"),
    })
    .describe(
      "Text element value - use for simple text fields like titles, descriptions, etc.",
    ),

  richText: z
    .object({
      value: z
        .string()
        .describe(
          "Rich text content as a subset of HTML string format. See: https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#section/HTML5-elements-allowed-in-rich-text",
        ),
    })
    .describe(
      "Rich text element value - use for formatted content with HTML subset (specific HTML5 elements and attributes supported by Kontent.ai)",
    ),

  number: z
    .object({
      value: z.number().describe("Numeric value"),
    })
    .describe(
      "Number element value - use for numeric fields like prices, quantities, etc.",
    ),

  dateTime: z
    .object({
      value: z
        .string()
        .nullable()
        .describe("ISO-8601 date-time string or null"),
    })
    .describe(
      "Date-time element value - use ISO format like '2023-12-25T10:30:00.000Z' or null for empty",
    ),

  multipleChoice: z
    .object({
      value: z
        .array(
          z.object({
            codename: z.string().describe("Codename of the selected option"),
          }),
        )
        .describe("Array of selected option references"),
    })
    .describe(
      "Multiple choice element value - reference options by their codename",
    ),

  asset: z
    .object({
      value: z
        .array(
          z.object({
            codename: z.string().describe("Codename of the asset"),
          }),
        )
        .describe("Array of asset references"),
    })
    .describe("Asset element value - reference assets by their codename"),

  modularContent: z
    .object({
      value: z
        .array(
          z.object({
            codename: z
              .string()
              .describe("Codename of the linked content item"),
          }),
        )
        .describe("Array of content item references"),
    })
    .describe(
      "Modular content element value - reference other content items by their codename",
    ),

  taxonomy: z
    .object({
      value: z
        .array(
          z.object({
            codename: z.string().describe("Codename of the taxonomy term"),
          }),
        )
        .describe("Array of taxonomy term references"),
    })
    .describe(
      "Taxonomy element value - reference taxonomy terms by their codename",
    ),

  urlSlug: z
    .object({
      value: z.string().describe("URL slug value"),
    })
    .describe("URL slug element value - use for SEO-friendly URLs"),

  custom: z
    .object({
      value: z.string().describe("JSON string value"),
    })
    .describe(
      "Custom element value - depends on the custom element implementation",
    ),
};
