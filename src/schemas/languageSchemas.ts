import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

export const addLanguageSchema = z.object({
  name: z.string().describe("Display name of the language"),
  codename: z.string().describe("Codename identifier for the language"),
  fallback_language: referenceObjectSchema
    .optional()
    .describe(
      "Reference to fallback language (by id, codename, or external_id)",
    ),
  external_id: z.string().optional().describe("External ID for the language"),
});

const languageReplaceOperationSchema = z.discriminatedUnion("property_name", [
  z.object({
    op: z.literal("replace"),
    property_name: z.literal("codename"),
    value: z.string(),
  }),
  z.object({
    op: z.literal("replace"),
    property_name: z.literal("name"),
    value: z.string(),
  }),
  z.object({
    op: z.literal("replace"),
    property_name: z.literal("fallback_language"),
    value: referenceObjectSchema,
  }),
]);

export const patchLanguageSchema = z.object({
  languageId: z.string().describe("Language ID to modify"),
  operations: z
    .array(languageReplaceOperationSchema)
    .min(1)
    .describe(
      "Array of replace operations for codename, name, or fallback_language. Note: Only active languages can be modified. To activate/deactivate languages, use the Kontent.ai web UI.",
    ),
});
