import { z } from "zod";
import { coerceJsonString } from "./coerceJsonString.js";
import { writeReferenceObjectSchema } from "./referenceObjectSchema.js";

const nameReplaceOperationSchema = z.object({
  op: z.literal("replace"),
  property_name: z.literal("name"),
  value: z.string(),
});

const codenameReplaceOperationSchema = z.object({
  op: z.literal("replace"),
  property_name: z.literal("codename"),
  value: z.string(),
});

const collectionsReplaceOperationSchema = z.object({
  op: z.literal("replace"),
  property_name: z.literal("collections"),
  value: z
    .array(writeReferenceObjectSchema)
    .describe("Array of references to the collections this space includes."),
});

export const spacePatchOperationSchema = z.discriminatedUnion("property_name", [
  nameReplaceOperationSchema,
  codenameReplaceOperationSchema,
  collectionsReplaceOperationSchema,
]);

export const spacePatchOperationsSchema = z
  .array(spacePatchOperationSchema)
  .min(1);

export const addSpaceSchema = z.object({
  name: z.string(),
  codename: z.string().optional(),
  collections: coerceJsonString(
    z
      .array(writeReferenceObjectSchema)
      .describe("Array of references to the collections this space includes."),
  ).optional(),
});
