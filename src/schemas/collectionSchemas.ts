import { z } from "zod";
import { writeReferenceObjectSchema } from "./referenceObjectSchema.js";

const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  value: z.object({
    name: z.string(),
    codename: z.string().optional(),
    external_id: z.string().optional(),
  }),
  before: writeReferenceObjectSchema
    .optional()
    .describe("Reference to the sibling collection to insert before."),
  after: writeReferenceObjectSchema
    .optional()
    .describe("Reference to the sibling collection to insert after."),
});

const moveOperationSchema = z.object({
  op: z.literal("move"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the collection to move.",
  ),
  before: writeReferenceObjectSchema
    .optional()
    .describe("Reference to the sibling collection to move before."),
  after: writeReferenceObjectSchema
    .optional()
    .describe("Reference to the sibling collection to move after."),
});

const removeOperationSchema = z.object({
  op: z.literal("remove"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the collection to remove.",
  ),
});

const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the collection to update.",
  ),
  property_name: z.enum(["name"]),
  value: z.string(),
});

export const collectionPatchOperationSchema = z.discriminatedUnion("op", [
  addIntoOperationSchema,
  moveOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

export const collectionPatchOperationsSchema = z
  .array(collectionPatchOperationSchema)
  .min(1);
