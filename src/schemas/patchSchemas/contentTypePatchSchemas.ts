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
  path: z.string().describe("Path to object (format: id:{uuid})"),
  before: referenceObjectSchema.optional(),
  after: referenceObjectSchema.optional(),
});

// AddInto operation - Add new elements to content type
const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  path: z.string().describe("Path where to add item (format: id:{uuid})"),
  value: z.union([
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
  ]),
});

// Remove operation - Remove elements from content type
const removeOperationSchema = z.object({
  op: z.literal("remove"),
  path: z.string().describe("Path to item to remove (format: id:{uuid})"),
});

// Replace operation - Replace/update existing elements in content type
const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  path: z.string().describe("Path to property to replace (format: id:{uuid})"),
  value: z.union([
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
    z.any(),
  ]),
});

// Union type for all patch operations
export const patchOperationSchema = z.discriminatedUnion("op", [
  moveOperationSchema,
  addIntoOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

// Schema for array of patch operations
export const patchOperationsSchema = z.array(patchOperationSchema).min(1);
