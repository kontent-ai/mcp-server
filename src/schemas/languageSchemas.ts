import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

export const addLanguageSchema = z.object({
  name: z.string().describe("Display name of the language"),
  codename: z.string().describe("Codename identifier for the language"),
  is_active: z
    .boolean()
    .optional()
    .describe("Whether the language is active (defaults to true)"),
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
    property_name: z.literal("is_active"),
    value: z.boolean(),
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
      "Array of replace operations for codename, name, is_active, or fallback_language. Note: Only active languages can be modified - if language is deactivated, is_active: true must be first operation.",
    ),
});
