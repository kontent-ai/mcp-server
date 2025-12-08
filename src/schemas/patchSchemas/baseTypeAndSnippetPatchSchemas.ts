import { z } from "zod";
import {
  allowedBlockSchema,
  allowedFormattingSchema,
  allowedTableBlockSchema,
  allowedTableFormattingSchema,
  allowedTableTextBlockSchema,
  allowedTextBlockSchema,
  arrayDefaultSchema,
  countLimitSchema,
  numberDefaultSchema,
  optionSchema,
  regexValidationSchema,
  stringDefaultSchema,
  textLengthLimitSchema,
} from "../contentTypeAndSnippetSchemas.js";
import { referenceObjectSchema } from "../referenceObjectSchema.js";

export const moveOperationSchema = z.object({
  op: z.literal("move"),
  path: z.string().describe("Path to object (format: id:{uuid})"),
  before: referenceObjectSchema.optional(),
  after: referenceObjectSchema.optional(),
});

export const removeOperationSchema = z.object({
  op: z.literal("remove"),
  path: z.string().describe("Path to item to remove (format: id:{uuid})"),
});

export const sharedAddIntoValueSchemas = [
  optionSchema,
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
] as const;

export const sharedReplaceValueSchemas = [
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
] as const;
