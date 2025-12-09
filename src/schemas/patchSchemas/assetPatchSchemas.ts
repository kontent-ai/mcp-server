import { z } from "zod";
import { referenceObjectSchema } from "../referenceObjectSchema.js";

const fileReferenceSchema = z.object({
  id: z.string(),
  type: z.literal("internal"),
});

const assetDescriptionSchema = z.object({
  language: referenceObjectSchema,
  description: z.string(),
});

const assetTaxonomyElementSchema = z.object({
  element: referenceObjectSchema,
  value: z.array(referenceObjectSchema),
});

const assetCollectionReferenceSchema = z.object({
  reference: referenceObjectSchema,
});

export const upsertAssetDataSchema = z.object({
  file_reference: fileReferenceSchema
    .optional()
    .describe("Required when creating new asset"),
  title: z.string().optional(),
  codename: z.string().optional(),
  collection: assetCollectionReferenceSchema.optional(),
  folder: referenceObjectSchema.optional(),
  descriptions: z.array(assetDescriptionSchema).optional(),
  elements: z.array(assetTaxonomyElementSchema).optional(),
});
