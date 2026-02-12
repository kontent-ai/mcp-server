import { z } from "zod";
import { continuationTokenField } from "./listSchemas.js";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

export const bulkGetItemsWithVariantsSchema = z.object({
  variants: z
    .array(
      z.object({
        item: referenceObjectSchema.describe(
          "Reference to a content item by its id, codename, or external id",
        ),
        language: referenceObjectSchema.describe(
          "Reference to a language by its id, codename, or external id",
        ),
      }),
    )
    .min(1)
    .max(100)
    .describe(
      "Array of item and language reference pairs to retrieve (max 100). Use filter-variants-mapi to get item and language references first.",
    ),
  continuation_token: continuationTokenField,
});
