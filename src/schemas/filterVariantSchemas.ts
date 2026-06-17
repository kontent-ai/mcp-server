import { z } from "zod";
import { coerceJsonString } from "./coerceJsonString.js";
import { continuationTokenField } from "./listSchemas.js";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

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
      .array(referenceObjectSchema)
      .min(1)
      .describe(
        "Array of references to content types by their id, codename, or external id",
      ),
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
  language: referenceObjectSchema
    .optional()
    .describe(
      "Reference to a language by its id, codename, or external id (defaults to default language)",
    ),
  workflow_steps: coerceJsonString(
    z
      .array(
        z.object({
          workflow_identifier: referenceObjectSchema.describe(
            "Reference to a workflow by its id, codename, or external id",
          ),
          step_identifiers: z
            .array(referenceObjectSchema)
            .min(1)
            .describe(
              "Array of references to workflow steps by their id, codename, or external id",
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
          taxonomy_identifier: referenceObjectSchema.describe(
            "Reference to a taxonomy group by its id, codename, or external id",
          ),
          term_identifiers: z
            .array(referenceObjectSchema)
            .optional()
            .describe(
              "Array of references to taxonomy terms by their id, codename, or external id",
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
      .array(referenceObjectSchema)
      .min(1)
      .describe(
        "Array of references to spaces by their id or codename (external_id is not supported for spaces)",
      ),
  ).optional(),
  collections: coerceJsonString(
    z
      .array(referenceObjectSchema)
      .min(1)
      .describe(
        "Array of references to collections by their id, codename, or external id",
      ),
  ).optional(),
  component_types: coerceJsonString(
    z
      .array(referenceObjectSchema)
      .min(1)
      .describe(
        "Array of references to content component types stored in variants by their type id, codename, or external id",
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
