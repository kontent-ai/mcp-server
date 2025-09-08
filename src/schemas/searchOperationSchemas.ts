import { z } from "zod";

export const searchOperationSchema = z.object({
  actionName: z
    .literal("Search")
    .describe("Fixed action name for search operations"),
  type: z
    .literal("multiple-inputs-request-v1")
    .describe("Request type identifier for multiple inputs"),
  inputs: z
    .object({
      searchPhrase: z
        .object({
          type: z.literal("string"),
          value: z.string(),
        })
        .describe(
          "Search phrase for AI-powered semantic search. Uses vector database to find content by meaning and similarity, not just exact keyword matching",
        ),
      filter: z
        .object({
          type: z.literal("content-item-variant-filter"),
          value: z.object({
            variantId: z
              .string()
              .uuid()
              .describe("UUID of the language variant to filter by"),
          }),
        })
        .describe(
          "Mandatory content item variant filter to restrict search scope. Must specify a valid variant UUID",
        ),
    })
    .describe("Search inputs containing search phrase and mandatory filter"),
  trackingData: z
    .object({
      type: z.literal("empty-operation-tracking-data-v1"),
    })
    .describe("Tracking data for operation monitoring"),
});
