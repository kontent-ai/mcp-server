import { z } from "zod";

export const searchOperationSchema = z.object({
  searchPhrase: z
    .string()
    .describe(
      "Search phrase for AI-powered semantic search. Uses vector database to find content by meaning and similarity, not just exact keyword matching",
    ),
  filter: z
    .object({
      variantId: z.uuid()
        .describe("UUID of the language variant to filter by"),
    })
    .describe(
      "Mandatory content item variant filter to restrict search scope. Must specify a valid variant UUID",
    ),
});
