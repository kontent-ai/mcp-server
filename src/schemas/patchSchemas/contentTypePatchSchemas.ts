// Patch operation schemas for content type modifications
// Based on: https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#operation/modify-a-content-type

import { z } from "zod";
import {
  allowedBlockSchema,
  allowedFormattingSchema,
  allowedTableBlockSchema,
  allowedTableFormattingSchema,
  allowedTableTextBlockSchema,
  allowedTextBlockSchema,
  arrayDefaultSchema,
  contentGroupSchema,
  countLimitSchema,
  dependsOnSchema,
  elementSchema,
  numberDefaultSchema,
  optionSchema,
  referenceObjectSchema,
  regexValidationSchema,
  stringDefaultSchema,
  textLengthLimitSchema,
} from "../contentTypeSchemas.js";

// Move operation - Move elements within content type
const moveOperationSchema = z.object({
  op: z.literal("move"),
  path: z
    .string()
    .describe(`Identifies the object you want to move using a path reference. The path reference should be in format 'id:{uuid}'. Examples:
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
  path: z
    .string()
    .describe(`JSON Pointer path where to add the item. The path reference should be in format 'id:{uuid}'. Examples:
    • '/elements' - Add a new element to the content type
    • '/content_groups' - Add a new content group
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types' - Add allowed content type to rich text or linked items element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_elements' - Add allowed element to custom element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/options' - Add multiple choice option
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_blocks' - Add block for rich text element
    • '/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_formatting' - Add formatting option for rich text element
    (Replace with actual element UUID)

    - CRITICAL: When adding a url slug that references a snippet element, first add the snippet element to the content type if it’s not already included.`),
  value: z
    .union([
      elementSchema,
      optionSchema,
      contentGroupSchema,
      referenceObjectSchema,
      allowedBlockSchema,
      allowedFormattingSchema,
      allowedTextBlockSchema,
      allowedTableBlockSchema,
      allowedTableFormattingSchema,
      allowedTableTextBlockSchema,
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      z.any(),
    ])
    .describe("The item to add (element, content group, option, etc.)"),
});

// Remove operation - Remove elements from content type
const removeOperationSchema = z.object({
  op: z.literal("remove"),
  path: z
    .string()
    .describe(`JSON Pointer path to the item being removed. The path reference should be in format 'id:{uuid}'. Examples:
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
  path: z
    .string()
    .describe(`JSON Pointer path to the item or property being replaced. The path reference should be in format 'id:{uuid}' Examples:
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
  value: z
    .union([
      dependsOnSchema,
      regexValidationSchema,
      textLengthLimitSchema,
      countLimitSchema,
      arrayDefaultSchema,
      stringDefaultSchema,
      numberDefaultSchema,
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      z.any(), // in Union zod tries to match from top to down. any if there is something missing so agent dont fail on validation.
    ])
    .describe("The new value to replace the existing one"),
});

// Union type for all patch operations
export const patchOperationSchema = z.discriminatedUnion("op", [
  moveOperationSchema,
  addIntoOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

// Schema for array of patch operations
export const patchOperationsSchema = z
  .array(patchOperationSchema)
  .min(1)
  .describe(
    "Array of patch operations to apply to the content type. Must contain at least one operation.",
  );
