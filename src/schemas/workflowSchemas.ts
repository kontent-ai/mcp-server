import { z } from "zod";

// Schema for a workflow step
const workflowStepSchema = z.object({
  id: z
    .guid()
    .describe("The unique identifier of the workflow step in UUID format"),
  name: z.string().describe("The human-readable name of the workflow step"),
  codename: z
    .string()
    .describe("The codename of the workflow step used for API operations"),
  transitions_to: z
    .array(z.guid())
    .describe("Array of workflow step IDs that this step can transition to")
    .optional(),
  role_ids: z
    .array(z.guid())
    .describe("Array of role IDs that have permissions for this workflow step")
    .optional(),
});

// Schema for the published step
const publishedStepSchema = z.object({
  id: z
    .guid()
    .describe("The unique identifier of the published step in UUID format"),
  name: z
    .string()
    .describe("The name of the published step - typically 'Published'"),
  codename: z
    .string()
    .describe("The codename of the published step - typically 'published'"),
  unpublish_role_ids: z
    .array(z.guid())
    .describe("Array of role IDs that can unpublish content from this step")
    .optional(),
  create_new_version_role_ids: z
    .array(z.guid())
    .describe(
      "Array of role IDs that can create new versions of content in this step",
    )
    .optional(),
});

// Schema for the scheduled step
const scheduledStepSchema = z.object({
  id: z
    .guid()
    .describe("The unique identifier of the scheduled step in UUID format"),
  name: z
    .string()
    .describe("The name of the scheduled step - typically 'Scheduled'"),
  codename: z
    .string()
    .describe("The codename of the scheduled step - typically 'scheduled'"),
});

// Schema for the archived step
const archivedStepSchema = z.object({
  id: z
    .guid()
    .describe("The unique identifier of the archived step in UUID format"),
  name: z
    .string()
    .describe("The name of the archived step - typically 'Archived'"),
  codename: z
    .string()
    .describe("The codename of the archived step - typically 'archived'"),
  role_ids: z
    .array(z.guid())
    .describe("Array of role IDs that can unarchive content from this step")
    .optional(),
});

// Schema for workflow scope
const workflowScopeSchema = z.object({
  content_types: z
    .array(
      z.object({
        id: z
          .guid()
          .describe("The unique identifier of the content type in UUID format"),
      }),
    )
    .describe("Array of content types that this workflow applies to"),
});

// Main workflow schema
export const workflowSchema = z.object({
  id: z.guid().describe("The unique identifier of the workflow in UUID format"),
  name: z.string().describe("The human-readable name of the workflow"),
  codename: z
    .string()
    .describe("The codename of the workflow used for API operations"),
  scopes: z
    .array(workflowScopeSchema)
    .describe("Array of scopes defining which content types use this workflow"),
  steps: z
    .array(workflowStepSchema)
    .describe(
      "Array of custom workflow steps between draft and published states",
    ),
  published_step: publishedStepSchema.describe(
    "The published step configuration of the workflow",
  ),
  scheduled_step: scheduledStepSchema.describe(
    "The scheduled step configuration of the workflow",
  ),
  archived_step: archivedStepSchema.describe(
    "The archived step configuration of the workflow",
  ),
});

// Schema for the list workflows response
export const listWorkflowsResponseSchema = z
  .array(workflowSchema)
  .describe("Array of workflows in the project");
