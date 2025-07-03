// Patch operation schemas for content type modifications
// Based on: https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#operation/modify-a-content-type

import { z } from "zod";
import { allowedBlockSchema, allowedFormattingSchema, allowedTableBlockSchema, allowedTableFormattingSchema, allowedTableTextBlockSchema, allowedTextBlockSchema, elementSchema, optionSchema } from "../contentTypeSchemas.js";

const referenceObjectSchema = z.object({
  codename: z.string().describe("The codename of the object to reference"),
});

// Move operation - Move elements within content type
const moveOperationSchema = z.object({
  op: z.literal("move"),
  path: z.string().describe(`Identifies the object you want to move using a path reference. The path reference should be in format 'codename:{codename}'. Examples:
    • '/elements/codename:my_element' - Move an element
    • '/elements/codename:my_element/options/codename:my_option' - Move a multiple choice option (first reference is element, second is option)
    • '/content_groups/codename:my_group' - Move a content group`),
  before: referenceObjectSchema
    .describe(
      "A reference to the object before which you want to move the object. For example, to move an element before an existing element with codename 'text', set before to {codename: 'text'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
  after: referenceObjectSchema
    .describe(
      "A reference to the object after which you want to move the object. For example, to move an element after an existing element with codename 'Text', set after to {codename: 'text'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
});

// AddInto operation - Add new elements to content type
const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  path: z.string().describe(`JSON Pointer path where to add the item. The path reference should be in format 'codename:{codename}'. Examples:
    • '/elements' - Add a new element to the content type
    • '/content_groups' - Add a new content group
    • '/elements/codename:my_element/allowed_content_types' - Add allowed content type to rich text or linked items element
    • '/elements/codename:my_element/allowed_elements' - Add allowed element to custom element
    • '/elements/codename:my_element/options' - Add multiple choice option
    • '/elements/codename:my_element/allowed_blocks' - Add block for rich text element
    • '/elements/codename:my_element/allowed_formatting' - Add formatting option for rich text element
    (Replace codename:my_element with element codename)
    
    For allowed_formatting specifically:
    Specifies which text formatting is allowed in rich text elements. The "unstyled" value must precede any other values in the list.
    Available formatting options:
    - "unstyled": Allows text without any formatting
    - "bold": Allows bold text formatting
    - "italic": Allows italic text formatting  
    - "code": Allows monospace text formatting for code snippets
    - "link": Allows links (assets, content items, email addresses, web URLs)
    - "subscript": Allows subscript text formatting (below the line)
    - "superscript": Allows superscript text formatting (above the line)`),
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
  path: z.string().describe(`JSON Pointer path to the item being removed. The path reference should be in format 'codename:{codename}'. Examples:
    • '/elements/codename:my_element' - Remove an element
    • '/elements/codename:my_element/allowed_content_types/codename:my_content_type' - Remove allowed content type from rich text/linked items element
    • '/elements/codename:my_element/allowed_element/codename:my_element' - Remove allowed element from custom element
    • '/elements/codename:my_element/options/codename:my_option' - Remove multiple choice option
    • '/content_groups/codename:my_group' - Remove content group (removes all elements within the group)
    • '/elements/codename:my_element/allowed_blocks/images' - Remove rich-text element limitation (where {block} is the limitation type)
    (Replace codename:my_element with codename)`),
});

// Replace operation - Replace/update existing elements in content type
const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  path: z.string().describe(`JSON Pointer path to the item or property being replaced. The path reference should be in format 'codename:{codename}' Examples:
    • '/name' - Change the content type's name
    • '/codename' - Change the content type's codename
    • '/content_groups/codename:my_group/name' - Change the name of a content group
    • '/elements/codename:my_element/name' - Change an element property (property depends on element type)
    • '/elements/codename:my_element/options/codename:my_option/name' - Change multiple choice option property (name or codename)
    (Replace codename:my_element with element/group codename)
    
    REPLACE OPERATION RULES:
    • CAN modify: Most element properties based on element type (name, guidelines, validation, etc.)
    • CANNOT modify: external_id, id, or type of elements
    • CANNOT replace individual object values - must replace the entire object at once
    • CANNOT replace allowed_blocks, allowed_formatting, allowed_text_blocks, allowed_table_blocks, allowed_table_formatting, allowed_table_text_blocks for rich text elements - use addInto/remove operations instead for individual blocks
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
    {"op": "replace", "path": "/elements/codename:element1/content_group", "value": null},
    {"op": "replace", "path": "/elements/codename:element2/content_group", "value": null},
    ...repeat for all elements...
    {"op": "remove", "path": "/content_groups/codename:group1"},
    {"op": "remove", "path": "/content_groups/codename:group2"},
    ...repeat for all content groups...
  ]`
);