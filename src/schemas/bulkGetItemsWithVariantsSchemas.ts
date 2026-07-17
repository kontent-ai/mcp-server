import { z } from "zod";
import { coerceJsonString } from "./coerceJsonString.js";
import { continuationTokenField } from "./listSchemas.js";
import { readReferenceObjectSchema } from "./referenceObjectSchema.js";

export const bulkGetItemsWithVariantsSchema = z.object({
  variants: coerceJsonString(
    z
      .array(
        z.object({
          item: readReferenceObjectSchema.describe(
            "ID reference to a content item",
          ),
          language: readReferenceObjectSchema.describe(
            "ID reference to a language",
          ),
        }),
      )
      .min(1)
      .max(100)
      .describe(
        `Array of item and language reference pairs to retrieve (max 100).`,
      ),
  ),
  continuation_token: continuationTokenField,
});
