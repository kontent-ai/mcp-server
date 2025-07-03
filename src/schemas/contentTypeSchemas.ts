import { z } from "zod";

// Define a reusable reference object schema
const referenceObjectSchema = z
  .object({
    id: z.string().optional(),
    codename: z.string().optional(),
  })
  .describe(
    "An object with an id or codename property referencing another item. Using id is preferred for better performance.",
  );

// Common property schemas
const baseElementSchema = {
  codename: z.string().optional(),
  external_id: z.string().optional(),
};

// Content group schema for content type elements only
const contentGroupElementSchema = {
  content_group: referenceObjectSchema
    .describe(
      "An object with an id or codename property referencing a content group.",
    )
    .optional(),
};

const namedElementSchema = {
  ...baseElementSchema,
  name: z.string(),
  guidelines: z.string().optional(),
  is_required: z.boolean().optional(),
  is_non_localizable: z.boolean().optional(),
};

// Limit schemas
const conditionEnum = z.enum(["at_most", "exactly", "at_least"]);

const countLimitSchema = z
  .object({
    value: z.number(),
    condition: conditionEnum,
  })
  .optional();

const imageLimitSchema = {
  image_width_limit: z
    .object({
      value: z.number(),
      condition: conditionEnum,
    })
    .optional(),
  image_height_limit: z
    .object({
      value: z.number(),
      condition: conditionEnum,
    })
    .optional(),
};

// Default value schemas
const arrayDefaultSchema = z
  .object({
    global: z.object({
      value: z.array(referenceObjectSchema),
    }),
  })
  .optional();

const stringDefaultSchema = z
  .object({
    global: z.object({
      value: z.string(),
    }),
  })
  .optional();

const numberDefaultSchema = z
  .object({
    global: z.object({
      value: z.number(),
    }),
  })
  .optional();

// Regex validation schema
const regexValidationSchema = z
  .object({
    is_active: z.boolean(),
    regex: z.string(),
    flags: z.string().optional(),
    validation_message: z.string().optional(),
  })
  .optional();

// Text length limit schema
const textLengthLimitSchema = z
  .object({
    value: z.number(),
    applies_to: z.enum(["words", "characters"]),
  })
  .optional();

// Individual element type schemas
const assetElementSchema = {
  type: z.literal("asset"),
  ...namedElementSchema,
  asset_count_limit: countLimitSchema,
  maximum_file_size: z.number().optional(),
  allowed_file_types: z.enum(["adjustable", "any"]).optional(),
  ...imageLimitSchema,
  default: arrayDefaultSchema.describe(
    "Default value of the asset element. Reference an existing asset by its id or codename.",
  ),
};

const customElementSchema = {
  type: z.literal("custom"),
  ...namedElementSchema,
  source_url: z.string(),
  json_parameters: z.string().optional(),
  allowed_elements: z
    .array(
      referenceObjectSchema.describe(
        "An object with an id or codename property referencing an element.",
      ),
    )
    .optional()
    .describe(
      "Specifies which elements from the content type can be used within this custom element.",
    ),
};

const dateTimeElementSchema = {
  type: z.literal("date_time"),
  ...namedElementSchema,
  default: stringDefaultSchema,
};

const guidelinesElementSchema = {
  type: z.literal("guidelines"),
  ...baseElementSchema,
  guidelines: z
    .string()
    .describe(
      "Value of the guidelines element. This is rich text and can include HTML formatting. Check the documentation here https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#section/HTML5-elements-allowed-in-rich-text for the supported format, but keep in mind that content items and components are not supported in guidelines. Use empty `<p>` tag for empty guidelines.",
    ),
};

const modularContentElementSchema = {
  type: z.literal("modular_content"),
  ...namedElementSchema,
  allowed_content_types: z
    .array(
      referenceObjectSchema.describe(
        "An object with an id or codename property referencing a content type. Use an empty array to allow all content types.",
      ),
    )
    .optional(),
  item_count_limit: countLimitSchema,
  default: arrayDefaultSchema.describe(
    "Default value of the modular content element. Reference an existing content item by its id or codename.",
  ),
};

const subpagesElementSchema = {
  type: z.literal("subpages"),
  ...namedElementSchema,
  allowed_content_types: z
    .array(
      referenceObjectSchema.describe(
        "An object with an id or codename property referencing a content type. Use an empty array to allow all content types.",
      ),
    )
    .optional(),
  item_count_limit: countLimitSchema,
};

export const optionSchema = z.object({
  name: z.string(),
  codename: z.string().optional(),
  external_id: z.string().optional(),
});

const multipleChoiceElementSchema = {
  type: z.literal("multiple_choice"),
  ...namedElementSchema,
  mode: z.enum(["single", "multiple"]),
  options: z.array(optionSchema),
  default: arrayDefaultSchema.describe(
    "Default value of the multiple choice element. Reference one of the options by its codename.",
  ),
};

const numberElementSchema = {
  type: z.literal("number"),
  ...namedElementSchema,
  default: numberDefaultSchema,
};

export const allowedBlockSchema = z.enum(["images", "text", "tables", "components-and-items"]);
export const allowedFormattingSchema = z.enum(["unstyled", "bold", "italic", "code", "link", "subscript", "superscript"]);
export const allowedTextBlockSchema = z.enum(["paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list"]);
export const allowedTableBlockSchema = z.enum(["images", "text"]);
export const allowedTableFormattingSchema = z.enum(["unstyled", "bold", "italic", "code", "link", "subscript", "superscript"]);
export const allowedTableTextBlockSchema = z.enum(["paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list"]);

const richTextElementSchema = {
  type: z.literal("rich_text"),
  ...namedElementSchema,
  allowed_blocks: z
    .array(allowedBlockSchema)
    .optional()
    .describe(
      "Specifies allowed blocks. Use an empty array to allow all options.",
    ),
  allowed_formatting: z
    .array(allowedFormattingSchema)
    .optional()
    .describe(
      "Specifies allowed formatting options. Use an empty array to allow all options.",
    ),
  allowed_text_blocks: z
    .array(allowedTextBlockSchema)
    .optional()
    .describe(
      "Specifies allowed text blocks. Use an empty array to allow all options.",
    ),
  allowed_table_blocks: z
    .array(allowedTableBlockSchema)
    .optional()
    .describe(
      "Specifies allowed table blocks. Use an empty array to allow all options.",
    ),
  allowed_table_formatting: z
    .array(allowedTableFormattingSchema)
    .optional()
    .describe(
      "Specifies allowed table formatting options. Use an empty array to allow all options.",
    ),
  allowed_table_text_blocks: z
    .array(allowedTableTextBlockSchema)
    .optional()
    .describe(
      "Specifies allowed table text blocks. Use an empty array to allow all options.",
    ),
  allowed_content_types: z
    .array(
      referenceObjectSchema.describe(
        "An object with an id or codename property referencing a content type.",
      ),
    )
    .optional()
    .describe(
      "Specifies allowed content types. Use an empty array to allow all content types.",
    ),
  allowed_item_link_types: z
    .array(
      referenceObjectSchema.describe(
        "An object with an id or codename property referencing a content type.",
      ),
    )
    .optional()
    .describe(
      "Specifies allowed item link types. Use an empty array to allow all link types.",
    ),
  ...imageLimitSchema,
  allowed_image_types: z.enum(["adjustable", "any"]).optional(),
  maximum_image_size: z.number().optional(),
  maximum_text_length: textLengthLimitSchema,
};

const snippetElement = {
  type: z.literal("snippet"),
  snippet: referenceObjectSchema.describe(
    "An object with an id or codename property referencing a snippet.",
  ),
  ...baseElementSchema,
};

const taxonomyElementSchema = {
  type: z.literal("taxonomy"),
  taxonomy_group: referenceObjectSchema.describe(
    "An object with an id or codename property referencing a taxonomy group.",
  ),
  ...namedElementSchema,
  term_count_limit: countLimitSchema,
  default: arrayDefaultSchema.describe(
    "Default value of the taxonomy element. Reference one of the terms from the specified taxonomy group by its codename.",
  ),
};

const textElementSchema = {
  type: z.literal("text"),
  ...namedElementSchema,
  maximum_text_length: textLengthLimitSchema,
  validation_regex: regexValidationSchema,
  default: stringDefaultSchema,
};

const urlSlugElementSchema = {
  type: z.literal("url_slug"),
  ...namedElementSchema,
  depends_on: z
    .object({
      element: referenceObjectSchema.describe(
        "An object with an id or codename property referencing an element.",
      ),
      snippet: referenceObjectSchema
        .describe(
          "An object with an id or codename property referencing a content type snippet.",
        )
        .optional(),
    })
    .describe(
      "The element the URL slug depends on. If this element is within a snippet, the snippet must also be specified.",
    ),
  validation_regex: regexValidationSchema,
};

// Define a union type of all possible element types for content types
export const elementSchema = z.discriminatedUnion("type", [
  z.object({
    ...assetElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...customElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...dateTimeElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...guidelinesElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...modularContentElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...subpagesElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...multipleChoiceElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...numberElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...richTextElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...snippetElement,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...taxonomyElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...textElementSchema,
    ...contentGroupElementSchema,
  }),
  z.object({
    ...urlSlugElementSchema,
    ...contentGroupElementSchema,
  }),
]);

// Define schema for content groups
export const contentGroupSchema = z.object({
  name: z.string(),
  external_id: z.string().optional(),
  codename: z.string().optional(),
});

// Define a union type for snippet elements (excluding url_slug and snippet elements)
export const snippetElementSchema = z.discriminatedUnion("type", [
  z.object(assetElementSchema),
  z.object(customElementSchema),
  z.object(dateTimeElementSchema),
  z.object(guidelinesElementSchema),
  z.object(modularContentElementSchema),
  z.object(subpagesElementSchema),
  z.object(multipleChoiceElementSchema),
  z.object(numberElementSchema),
  z.object(richTextElementSchema),
  z.object(taxonomyElementSchema),
  z.object(textElementSchema),
]);
