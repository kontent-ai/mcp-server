import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

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

export const updateAssetDataSchema = z
  .object({
    title: z.string().optional(),
    codename: z.string().optional(),
    collection: assetCollectionReferenceSchema.optional(),
    folder: referenceObjectSchema.optional(),
    descriptions: z.array(assetDescriptionSchema).optional(),
    elements: z.array(assetTaxonomyElementSchema).optional(),
  })
  .describe(
    "Only include properties you want to update; omitted fields retain existing values.",
  );
