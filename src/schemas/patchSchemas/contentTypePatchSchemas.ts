// Patch operation schemas for content type modifications
// Based on: https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#operation/modify-a-content-type

import { z } from "zod";
import { allowedBlockSchema, allowedFormattingSchema, allowedTableBlockSchema, allowedTableFormattingSchema, allowedTableTextBlockSchema, allowedTextBlockSchema, elementSchema, optionSchema, referenceObjectSchema } from "../contentTypeSchemas.js";

// Move operation - Move elements within content type
const moveOperationSchema = z.object({
  op: z.literal("move"),
  path: z.string().describe(`Identifies the object you want to move using a path reference. The path reference should be in format 'id:{uuid}'. Examples:
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000' - Move an element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:987fcdeb-51a2-43d1-9f4e-123456789abc' - Move a multiple choice option (first reference is element, second is option)
    • '/content_groups/id:456e7890-a12b-34c5-d678-901234567def' - Move a content group`),
  before: referenceObjectSchema
    .describe(
      "A reference to the object before which you want to move the object. For example, to move an element before an existing element with id:uuid 'text', set before to {codename: 'text'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
  after: referenceObjectSchema
    .describe(
      "A reference to the object after which you want to move the object. For example, to move an element after an existing element with id:uuid 'Text', set after to {codename: 'text'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
});

// AddInto operation - Add new elements to content type
const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  path: z.string().describe(`JSON Pointer path where to add the item. The path reference should be in format 'id:{uuid}'. Examples:
    • '/elements' - Add a new element to the content type
    • '/content_groups' - Add a new content group
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types' - Add allowed content type to rich text or linked items element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_elements' - Add allowed element to custom element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/options' - Add multiple choice option
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_blocks' - Add block for rich text element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_formatting' - Add formatting option for rich text element
    (Replace with actual element UUID)
    
    RICH TEXT ELEMENT PROPERTIES:
    
    allowed_content_types: Array of content type references. Specifies allowed content types for components and linked items. Empty array allows all.
    
    allowed_item_link_types: Array of content type references. Specifies content types allowed in text links (applies to text and tables). Empty array allows all.
    
    allowed_blocks: Available options: "images", "text", "tables", "components-and-items". Empty array allows all blocks.
    
    allowed_image_types: Available options: "adjustable" (only transformable images), "any" (all image files).
    
    allowed_text_blocks: Available options: "paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list". Empty array allows all.
    
    allowed_formatting: Available options: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript". "unstyled" must be first if used. Empty array allows all.
    
    allowed_table_blocks: Available options: "images", "text". Use ["text"] for text-only or empty array for both text and images.
    
    allowed_table_text_blocks: Available options: "paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list". Empty array allows all.
    
    allowed_table_formatting: Available options: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript". "unstyled" must be first if used. Empty array allows all.`),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    referenceObjectSchema,
    elementSchema,
    optionSchema,
    allowedBlockSchema,
    allowedFormattingSchema,
    allowedTextBlockSchema,
    allowedTableBlockSchema,
    allowedTableFormattingSchema,
    allowedTableTextBlockSchema,
  ]).describe("The item to add (element, content group, option, etc.)"),
});

// Remove operation - Remove elements from content type
const removeOperationSchema = z.object({
  op: z.literal("remove"),
  path: z.string().describe(`JSON Pointer path to the item being removed. The path reference should be in format 'id:{uuid}'. Examples:
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000' - Remove an element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types/id:987fcdeb-51a2-43d1-9f4e-123456789abc' - Remove allowed content type from rich text/linked items element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_element/id:456e7890-a12b-34c5-d678-901234567def' - Remove allowed element from custom element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:321dcba9-87f6-54e3-21b0-fedcba987654' - Remove multiple choice option
    • '/content_groups/id:456e7890-a12b-34c5-d678-901234567def' - Remove content group (removes all elements within the group)
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_blocks/images' - Remove rich-text element limitation (where {block} is the limitation type)
    (Replace with actual UUIDs)`),
});

// Replace operation - Replace/update existing elements in content type
const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  path: z.string().describe(`JSON Pointer path to the item or property being replaced. The path reference should be in format 'id:{uuid}' Examples:
    • '/name' - Change the content type's name
    • '/codename' - Change the content type's codename
    • '/content_groups/id:456e7890-a12b-34c5-d678-901234567def/name' - Change the name of a content group
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/name' - Change an element property (property depends on element type)
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:321dcba9-87f6-54e3-21b0-fedcba987654/name' - Change multiple choice option property (name or codename)
    (Replace with actual element/group UUIDs)
    
    REPLACE OPERATION RULES:
    • CAN modify: Most element properties based on element type (name, guidelines, validation, etc.)
    • CANNOT modify: external_id, id, or type of elements
    • CANNOT replace individual object values - must replace the entire object at once
    • FOR rich text elements: CANNOT replace individual items in allowed_blocks, allowed_formatting, allowed_text_blocks, allowed_table_blocks, allowed_table_formatting, allowed_table_text_blocks, allowed_content_types, allowed_item_link_types arrays - use addInto/remove operations instead for individual items
    • FOR multiple choice options: Can modify name and codename properties`),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
  ]).describe("The new value to replace the existing one"),
});

// Union type for all patch operations
export const patchOperationSchema = z.discriminatedUnion("op", [
  moveOperationSchema,
  addIntoOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

// Schema for array of patch operations
export const patchOperationsSchema = z.array(patchOperationSchema).min(1).describe(
  `Array of patch operations to apply to the content type. Must contain at least one operation.
  
  SPECIAL TECHNIQUE - Removing Content Groups While Keeping Elements at Top Level:
  To remove ALL content groups and move elements to the top level of the content type (without content groups), use this atomic approach:
  1. First, set ALL elements' content_group to null using replace operations
  2. Then, remove ALL content groups using remove operations
  3. CRITICAL: All operations MUST be in the SAME request to bypass validation
  
  Example atomic operations:
  [
    {"op": "replace", "path": "/elements/id:123e4567-e89b-12d3-a456-426614174000/content_group", "value": null},
    {"op": "replace", "path": "/elements/id:987fcdeb-51a2-43d1-9f4e-123456789abc/content_group", "value": null},
    ...repeat for all elements...
    {"op": "remove", "path": "/content_groups/id:456e7890-a12b-34c5-d678-901234567def"},
    {"op": "remove", "path": "/content_groups/id:321dcba9-87f6-54e3-21b0-fedcba987654"},
    ...repeat for all content groups...
  ]`
);