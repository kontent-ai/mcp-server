import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

const userReferenceSchema = z.object({
  id: z.string().optional().describe("User identifier"),
  email: z.string().email().optional().describe("User email address"),
});

// Search variants tool input schema
export const filterVariantsSchema = z.object({
  search_phrase: z
    .string()
    .optional()
    .describe("Search phrase to look for in content"),
  content_types: z
    .array(referenceObjectSchema)
    .min(1)
    .optional()
    .describe(
      "Array of references to content types by their id, codename, or external id",
    ),
  contributors: z
    .array(userReferenceSchema)
    .min(1)
    .optional()
    .describe("Array of references to users by their id or email"),
  has_no_contributors: z
    .boolean()
    .optional()
    .describe(
      "Filter for content item language variants that have no contributors assigned",
    ),
  completion_statuses: z
    .array(z.enum(["unfinished", "completed", "not_translated", "all_done"]))
    .min(1)
    .optional()
    .describe(
      "Array of completion statuses to filter by. It is not the same thing as workflow steps, it reflects e.g. not filled in required elements",
    ),
  language: referenceObjectSchema
    .optional()
    .describe(
      "Reference to a language by its id, codename, or external id (defaults to default language)",
    ),
  workflow_steps: z
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
    .optional()
    .describe("Array of workflows with workflow steps"),
  taxonomy_groups: z
    .array(
      z.object({
        taxonomy_identifier: referenceObjectSchema.describe(
          "Reference to a taxonomy group by its id, codename, or external id",
        ),
        term_identifiers: z
          .array(referenceObjectSchema)
          .describe(
            "Array of references to taxonomy terms by their id, codename, or external id",
          ),
        include_uncategorized: z
          .boolean()
          .describe(
            "Whether to include content item language variants that don't have any taxonomy terms assigned in this taxonomy group",
          ),
      }),
    )
    .min(1)
    .optional()
    .describe("Array of taxonomy groups with taxonomy terms"),
  order_by: z
    .enum(["name", "due", "last_modified"])
    .optional()
    .describe("Field to order by"),
  order_direction: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Order direction"),
  continuation_token: z
    .string()
    .optional()
    .describe("Continuation token for pagination"),
});
