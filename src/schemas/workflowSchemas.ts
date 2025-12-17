import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

// Step color options (matching SDK WorkflowColor type)
const workflowStepColorSchema = z
  .enum([
    "gray",
    "red",
    "rose",
    "light-purple",
    "dark-purple",
    "dark-blue",
    "light-blue",
    "sky-blue",
    "mint-green",
    "persian-green",
    "dark-green",
    "light-green",
    "yellow",
    "pink",
    "orange",
    "brown",
  ])
  .describe("Color of the workflow step displayed in the UI");

// Transition reference schema (step codename reference)
const transitionToStepSchema = z.object({
  codename: z.string().optional().describe("Target step codename"),
  id: z.guid().optional().describe("Target step ID (for update operations)"),
});

const transitionToSchema = z.object({
  step: transitionToStepSchema.describe("Reference to the target step"),
});

// Workflow step input schema (for creating/updating workflows)
const workflowStepInputSchema = z.object({
  name: z.string().describe("Human-readable name of the workflow step"),
  codename: z
    .string()
    .describe(
      "Codename of the workflow step. Must be unique across all workflows - usually prepended with the workflow codename.",
    ),
  color: workflowStepColorSchema,
  transitions_to: z
    .array(transitionToSchema)
    .min(1)
    .describe("Array of step references this step can transition to."),
  role_ids: z
    .array(z.guid())
    .min(1)
    .describe("Array of role IDs that have permissions for this step."),
});

// Published step input schema
const publishedStepInputSchema = z.object({
  unpublish_role_ids: z
    .array(z.guid())
    .min(1)
    .describe(
      "Array of role IDs that can unpublish content. Must include at least one role.",
    ),
  create_new_version_role_ids: z
    .array(z.guid())
    .min(1)
    .describe(
      "Array of role IDs that can create new versions. Must include at least one role.",
    ),
});

// Archived step input schema
const archivedStepInputSchema = z.object({
  role_ids: z
    .array(z.guid())
    .min(1)
    .describe(
      "Array of role IDs that can restore archived content. Must include at least one role.",
    ),
});

// Workflow scope input schema
const workflowScopeInputSchema = z.object({
  content_types: z
    .array(referenceObjectSchema)
    .describe("Content types this workflow applies to"),
  collections: z
    .array(referenceObjectSchema)
    .optional()
    .describe("Collections this workflow applies to"),
});

// Main add/update workflow schema
export const workflowInputSchema = z.object({
  name: z.string().describe("Human-readable name of the workflow"),
  codename: z
    .string()
    .optional()
    .describe("Codename for API operations (auto-generated if omitted)"),
  scopes: z
    .array(workflowScopeInputSchema)
    .describe(
      "Array of scopes defining which combinations of content types and collections this workflow applies to. If both content types and collections are empty, the workflow can be used for any type of content in collection that isn't limited to any other workflow.",
    ),
  steps: z
    .array(workflowStepInputSchema)
    .describe("Array of custom workflow steps"),
  published_step: publishedStepInputSchema.describe(
    "Configuration for the published step",
  ),
  archived_step: archivedStepInputSchema.describe(
    "Configuration for the archived step",
  ),
});
