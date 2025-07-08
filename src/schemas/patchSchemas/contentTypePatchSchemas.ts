// Patch operation schemas for content type modifications
// Based on: https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#operation/modify-a-content-type

import { z } from "zod";
import { allowedBlockSchema, allowedFormattingSchema, allowedTableBlockSchema, allowedTableFormattingSchema, allowedTableTextBlockSchema, allowedTextBlockSchema, arrayDefaultSchema, countLimitSchema, dependsOnSchema, elementSchema, numberDefaultSchema, optionSchema, referenceObjectSchema, regexValidationSchema, stringDefaultSchema, textLengthLimitSchema } from "../contentTypeSchemas.js";


// ============= MOVE OPERATIONS =============

const moveElementOperationSchema = z.object({
  op: z.literal("move"),
  pathType: z.literal("element"),
  path: z.string().regex(/^\/elements\/id:[a-f0-9-]+$/).describe("Path to an element"),
  before: referenceObjectSchema
    .describe(
      "A reference to the object before which you want to move the object. For example, to move an element before an existing element with codename 'text', set before to {codename: 'text'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
  after: referenceObjectSchema
    .describe(
      "A reference to the object after which you want to move the object. For example, to move an element after an existing element with codename 'text', set after to {codename: 'text'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
});

const moveElementOptionOperationSchema = z.object({
  op: z.literal("move"),
  pathType: z.literal("elementOption"),
  path: z.string().regex(/^\/elements\/id:[a-f0-9-]+\/options\/id:[a-f0-9-]+$/).describe("Path to an element option"),
  before: referenceObjectSchema
    .describe(
      "A reference to the object before which you want to move the object. For example, to move an option before an existing option with codename 'option1', set before to {codename: 'option1'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
  after: referenceObjectSchema
    .describe(
      "A reference to the object after which you want to move the object. For example, to move an option after an existing option with codename 'option1', set after to {codename: 'option1'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
});

const moveContentGroupOperationSchema = z.object({
  op: z.literal("move"),
  pathType: z.literal("contentGroup"),
  path: z.string().regex(/^\/content_groups\/id:[a-f0-9-]+$/).describe("Path to a content group"),
  before: referenceObjectSchema
    .describe(
      "A reference to the object before which you want to move the object. For example, to move a content group before an existing group with codename 'group1', set before to {codename: 'group1'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
  after: referenceObjectSchema
    .describe(
      "A reference to the object after which you want to move the object. For example, to move a content group after an existing group with codename 'group1', set after to {codename: 'group1'}. The before and after properties are mutually exclusive.",
    )
    .optional(),
});

// ============= ADDINTO OPERATIONS =============

// Rich Text Element Properties
const addIntoAllowedTextBlocksOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedTextBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_text_blocks$/),
  value: allowedTextBlockSchema.describe("Structural elements: paragraph, headings, lists")
});

const addIntoAllowedFormattingOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedFormatting"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_formatting$/),
  value: allowedFormattingSchema.describe("Text styling. MUST start with 'unstyled' when restricting. If it not present start with 'unstyled'")
});

const addIntoAllowedContentTypesOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedContentTypes"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_content_types$/),
  value: referenceObjectSchema.describe("Content type reference for embeddable components")
});

const addIntoAllowedItemLinkTypesOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedItemLinkTypes"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_item_link_types$/),
  value: referenceObjectSchema.describe("Content type reference for text links (applies to text and tables)")
});

const addIntoAllowedBlocksOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_blocks$/),
  value: allowedBlockSchema.describe("Available blocks: images, text, tables, components-and-items")
});

// Table Properties
const addIntoAllowedTableFormattingOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedTableFormatting"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_table_formatting$/),
  value: allowedTableFormattingSchema.describe("Table text styling. MUST start with 'unstyled' when restricting")
});

const addIntoAllowedTableTextBlocksOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedTableTextBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_table_text_blocks$/),
  value: allowedTableTextBlockSchema.describe("Structural elements for table cells")
});

const addIntoAllowedTableBlocksOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedTableBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_table_blocks$/),
  value: allowedTableBlockSchema.describe("Table blocks: images, text")
});

// Element Options and References
const addIntoOptionsOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("options"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/options$/),
  value: optionSchema.describe("Multiple choice option")
});

const addIntoAllowedElementsOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("allowedElements"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_elements$/),
  value: referenceObjectSchema.describe("Element reference for custom element")
});

// General Top-level Additions
const addIntoElementsOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("elements"),
  path: z.literal("/elements"),
  value: elementSchema.describe("Element to add to the content type"),
});

const addIntoContentGroupsOperationSchema = z.object({
  op: z.literal("addInto"),
  pathType: z.literal("contentGroups"),
  path: z.literal("/content_groups"),
  value: z.object({
    name: z.string(),
    codename: z.string().optional(),
    external_id: z.string().optional(),
  }).describe("Content group object")
});

// ============= REMOVE OPERATIONS =============

// Rich Text Element Properties
const removeAllowedTextBlocksOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedTextBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_text_blocks\/[a-z-]+$/),
});

const removeAllowedFormattingOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedFormatting"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_formatting\/[a-z-]+$/),
});

const removeAllowedContentTypesOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedContentTypes"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_content_types\/id:[a-f0-9-]+$/),
});

const removeAllowedItemLinkTypesOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedItemLinkTypes"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_item_link_types\/id:[a-f0-9-]+$/),
});

const removeAllowedBlocksOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_blocks\/[a-z-]+$/),
});

// Table Properties
const removeAllowedTableFormattingOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedTableFormatting"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_table_formatting\/[a-z-]+$/),
});

const removeAllowedTableTextBlocksOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedTableTextBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_table_text_blocks\/[a-z-]+$/),
});

const removeAllowedTableBlocksOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedTableBlocks"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_table_blocks\/[a-z-]+$/),
});

// Element Options and References
const removeOptionsOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("options"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/options\/id:[a-f0-9-]+$/),
});

const removeAllowedElementsOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("allowedElements"),
  path: z.string().regex(/\/elements\/id:[a-f0-9-]+\/allowed_elements\/id:[a-f0-9-]+$/),
});

// General Removals
const removeElementOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("element"),
  path: z.string().regex(/^\/elements\/id:[a-f0-9-]+$/).describe("Path to an element"),
});

const removeContentGroupOperationSchema = z.object({
  op: z.literal("remove"),
  pathType: z.literal("contentGroup"),
  path: z.string().regex(/^\/content_groups\/id:[a-f0-9-]+$/).describe("Path to a content group"),
});

// ============= REPLACE OPERATIONS =============

const replaceContentTypeNameOperationSchema = z.object({
  op: z.literal("replace"),
  pathType: z.literal("contentTypeName"),
  path: z.literal("/name"),
  value: z.string().describe("New content type name"),
});

const replaceContentTypeCodenameOperationSchema = z.object({
  op: z.literal("replace"),
  pathType: z.literal("contentTypeCodename"),
  path: z.literal("/codename"),
  value: z.string().describe("New content type codename"),
});

const replaceContentGroupNameOperationSchema = z.object({
  op: z.literal("replace"),
  pathType: z.literal("contentGroupName"),
  path: z.string().regex(/^\/content_groups\/id:[a-f0-9-]+\/name$/).describe("Path to content group name"),
  value: z.string().describe("New content group name"),
});

const replaceElementPropertyOperationSchema = z.object({
  op: z.literal("replace"),
  pathType: z.literal("elementProperty"),
  path: z.string().regex(/^\/elements\/id:[a-f0-9-]+\/[a-z_]+$/).describe("Path to element property"),
  value: z.union([
    z.string(), 
    z.number(), 
    z.boolean(), 
    z.null(), 
    countLimitSchema, 
    arrayDefaultSchema, 
    stringDefaultSchema, 
    numberDefaultSchema, 
    regexValidationSchema, 
    textLengthLimitSchema, 
    dependsOnSchema,
  ]).describe("New property value"),
});

const replaceElementOptionPropertyOperationSchema = z.object({
  op: z.literal("replace"),
  pathType: z.literal("elementOptionProperty"),
  path: z.string().regex(/^\/elements\/id:[a-f0-9-]+\/options\/id:[a-f0-9-]+\/(name|codename)$/).describe("Path to element option property"),
  value: z.string().describe("New option property value"),
});

// ============= CUSTOM VALIDATION FUNCTIONS =============

// Type for patch operations array to avoid circular reference
type PatchOperation = z.infer<typeof patchOperationSchema>;

// Add custom validation functions
const validateFormattingRestriction = (operations: PatchOperation[]): boolean => {
  const formattingOps = operations.filter((op: PatchOperation) => 
    op.op === "addInto" && 
    ((op as any).pathType === "allowedFormatting" || (op as any).pathType === "allowedTableFormatting")
  );
  
  if (formattingOps.length > 0) {
    // Check if "unstyled" is being added first
    const unstyledFirst = formattingOps.some((op: PatchOperation) => (op as any).value === "unstyled");
    if (!unstyledFirst) {
      throw new Error("When restricting formatting, 'unstyled' must be included as the first option");
    }
  }
  
  return true;
};

// ============= DISCRIMINATED UNIONS BY OPERATION TYPE =============

// Move operations discriminated union
export const moveOperationsSchema = z.discriminatedUnion("pathType", [
  moveElementOperationSchema,
  moveElementOptionOperationSchema,
  moveContentGroupOperationSchema,
]);

// AddInto operations discriminated union  
export const addIntoOperationsSchema = z.discriminatedUnion("pathType", [
  addIntoAllowedTextBlocksOperationSchema,
  addIntoAllowedFormattingOperationSchema,
  addIntoAllowedContentTypesOperationSchema,
  addIntoAllowedItemLinkTypesOperationSchema,
  addIntoAllowedBlocksOperationSchema,
  addIntoAllowedTableFormattingOperationSchema,
  addIntoAllowedTableTextBlocksOperationSchema,
  addIntoAllowedTableBlocksOperationSchema,
  addIntoOptionsOperationSchema,
  addIntoAllowedElementsOperationSchema,
  addIntoElementsOperationSchema,
  addIntoContentGroupsOperationSchema,
]);

// Remove operations discriminated union
export const removeOperationsSchema = z.discriminatedUnion("pathType", [
  removeAllowedTextBlocksOperationSchema,
  removeAllowedFormattingOperationSchema,
  removeAllowedContentTypesOperationSchema,
  removeAllowedItemLinkTypesOperationSchema,
  removeAllowedBlocksOperationSchema,
  removeAllowedTableFormattingOperationSchema,
  removeAllowedTableTextBlocksOperationSchema,
  removeAllowedTableBlocksOperationSchema,
  removeOptionsOperationSchema,
  removeAllowedElementsOperationSchema,
  removeElementOperationSchema,
  removeContentGroupOperationSchema,
]);

// Replace operations discriminated union
export const replaceOperationsSchema = z.union( [
  replaceContentTypeNameOperationSchema,
  replaceContentTypeCodenameOperationSchema,
  replaceContentGroupNameOperationSchema,
  replaceElementPropertyOperationSchema,
  replaceElementOptionPropertyOperationSchema,
]);

// ============= MAIN UNION =============

// Main union of all operation types - use this for validation
export const patchOperationSchema = z.union([
  moveOperationsSchema,
  addIntoOperationsSchema,
  removeOperationsSchema,
  replaceOperationsSchema,
]);

// Schema for array of patch operations
export const patchOperationsSchema = z.array(patchOperationSchema).min(1).describe(
  `Array of patch operations to apply. Supports move, addInto/remove, and replace operations following RFC 6902 JSON Patch specification.
  
  RULES:
  - Replace operations cannot modify individual array items - use addInto/remove instead
  - External_id and type cannot be modified after creation
  - To remove content groups while keeping elements at top level, set ALL elements' content_group to null AND remove ALL content groups in ONE request.
  
  OPERATION TYPES:
  - move: Move elements, options, or content groups within the content type
  - addInto: Add new items to arrays or collections (elements, options, allowed values, etc.)
  - remove: Remove specific items from arrays or remove entire elements/groups
  - replace: Replace individual property values (names, validation rules, etc.)
  
  PATH TYPES:
  Each operation type supports specific path types that determine the target of the operation.`
).refine(validateFormattingRestriction, {
  message: "When restricting formatting, 'unstyled' must be included as the first option"
});
