import { z } from "zod";

export const searchOperationSchema = z.object({
  searchPhrase: z
    .string()
    .describe(
      "Search phrase for AI-powered semantic search. Uses vector database to find content by meaning and similarity, not just exact keyword matching",
    ),
  filter: z.object({
    variantId: z
      .guid()
      .describe(
        "Language ID from list-languages-mapi. Use default language (is_default=true) if not specified by user.",
      ),
  }),
});
