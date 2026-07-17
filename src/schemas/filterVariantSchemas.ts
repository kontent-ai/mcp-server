import { z } from "zod";
import { coerceJsonString } from "./coerceJsonString.js";
import { continuationTokenField } from "./listSchemas.js";
import { readReferenceObjectSchema } from "./referenceObjectSchema.js";

// UserReferenceDataContract is a union type - either id or email, but not both
const userReferenceSchema = z
  .union([
    z.object({
      id: z.string().describe("User identifier"),
      email: z.never().optional(),
    }),
    z.object({
      id: z.never().optional(),
      email: z.email().describe("User email address"),
    }),
  ])
  .describe("Reference to a user by either their id or email (but not both)");

// Search variants tool input schema
export const filterVariantsSchema = z.object({
  search_phrase: z
    .string()
    .optional()
    .describe("Specific phrase or keywords to look for in content"),
  content_types: coerceJsonString(
    z
      .array(readReferenceObjectSchema)
      .min(1)
      .describe("Array of ID references to content types."),
  ).optional(),
  contributors: coerceJsonString(
    z
      .array(userReferenceSchema)
      .min(1)
      .describe(
        "Array of references to users by their id or email (but not both per user)",
      ),
  ).optional(),
  has_no_contributors: z
    .boolean()
    .optional()
    .describe(
      "Filter for content item variants that have no contributors assigned",
    ),
  completion_statuses: coerceJsonString(
    z
      .array(z.enum(["unfinished", "ready", "not_translated", "all_done"]))
      .min(1)
      .describe(
        "Array of completion statuses to filter by. It is not the same thing as workflow steps, it reflects e.g. not filled in required elements",
      ),
  ).optional(),
  language: readReferenceObjectSchema
    .optional()
    .describe("ID reference to a language (defaults to default language)."),
  workflow_steps: coerceJsonString(
    z
      .array(
        z.object({
          workflow_identifier: readReferenceObjectSchema.describe(
            "ID reference to a workflow.",
          ),
          step_identifiers: z
            .array(readReferenceObjectSchema)
            .min(1)
            .describe(
              "Array of ID references to workflow steps (from the same workflow's steps, as returned by list-workflows).",
            ),
        }),
      )
      .min(1)
      .describe("Array of workflows with workflow steps"),
  ).optional(),
  taxonomy_groups: coerceJsonString(
    z
      .array(
        z.object({
          taxonomy_identifier: readReferenceObjectSchema.describe(
            "ID reference to a taxonomy group.",
          ),
          term_identifiers: z
            .array(readReferenceObjectSchema)
            .optional()
            .describe(
              "Array of ID references to taxonomy terms (from the same taxonomy group, as returned by list-taxonomy-groups).",
            ),
          include_uncategorized: z
            .boolean()
            .optional()
            .describe(
              "Whether to include content item variants that don't have any taxonomy terms assigned in this taxonomy group",
            ),
        }),
      )
      .min(1)
      .describe("Array of taxonomy groups with taxonomy terms"),
  ).optional(),
  spaces: coerceJsonString(
    z
      .array(readReferenceObjectSchema)
      .min(1)
      .describe("Array of ID references to spaces."),
  ).optional(),
  collections: coerceJsonString(
    z
      .array(readReferenceObjectSchema)
      .min(1)
      .describe("Array of ID references to collections."),
  ).optional(),
  component_types: coerceJsonString(
    z
      .array(readReferenceObjectSchema)
      .min(1)
      .describe(
        "Array of ID references to content component types stored in variants.",
      ),
  ).optional(),
  publishing_states: coerceJsonString(
    z
      .array(z.enum(["published", "unpublished", "not_published_yet"]))
      .min(1)
      .describe(
        "Array of publishing states to filter by. 'published' - variant is currently published, 'unpublished' - variant was published but is now unpublished, 'not_published_yet' - variant has never been published",
      ),
  ).optional(),
  order_by: z
    .enum(["name", "due_date", "last_modified"])
    .optional()
    .describe("Field to order by"),
  order_direction: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Order direction"),
  continuation_token: continuationTokenField,
});
