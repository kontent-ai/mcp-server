import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  value: z.object({
    name: z.string(),
    codename: z.string().optional(),
    external_id: z.string().optional(),
  }),
  before: referenceObjectSchema.optional(),
  after: referenceObjectSchema.optional(),
});

const moveOperationSchema = z.object({
  op: z.literal("move"),
  reference: referenceObjectSchema,
  before: referenceObjectSchema.optional(),
  after: referenceObjectSchema.optional(),
});

const removeOperationSchema = z.object({
  op: z.literal("remove"),
  reference: referenceObjectSchema,
});

const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  reference: referenceObjectSchema,
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
