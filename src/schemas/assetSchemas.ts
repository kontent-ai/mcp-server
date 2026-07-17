import { z } from "zod";
import { writeReferenceObjectSchema } from "./referenceObjectSchema.js";

const assetDescriptionSchema = z.object({
  language: writeReferenceObjectSchema.describe(
    "Reference to the language this description is written in.",
  ),
  description: z.string(),
});

const assetTaxonomyElementSchema = z.object({
  element: writeReferenceObjectSchema.describe(
    "Reference to the taxonomy element this value is for.",
  ),
  value: z
    .array(writeReferenceObjectSchema)
    .describe("Array of references to the selected taxonomy terms."),
});

const assetCollectionReferenceSchema = z.object({
  reference: writeReferenceObjectSchema.describe(
    "Reference to the collection to assign this asset to.",
  ),
});

export const updateAssetDataSchema = z
  .object({
    title: z.string().optional(),
    codename: z.string().optional(),
    collection: assetCollectionReferenceSchema.optional(),
    folder: writeReferenceObjectSchema
      .optional()
      .describe("Reference to the destination asset folder."),
    descriptions: z.array(assetDescriptionSchema).optional(),
    elements: z.array(assetTaxonomyElementSchema).optional(),
  })
  .describe(
    "Only include properties you want to update; omitted fields retain existing values.",
  );
