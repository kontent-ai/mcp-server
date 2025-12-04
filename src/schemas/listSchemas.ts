import { z } from "zod";

// Reusable continuation token schema for paginated list operations
export const continuationTokenField = z
  .string()
  .optional()
  .describe(
    "Continuation token from a previous response to fetch the next page of results. Omit this parameter (or set to null) to fetch the first page. The response will include a continuation_token field - use this value in the next request to fetch the next page. When continuation_token in the response is null, there are no more pages available.",
  );

// Schema for listing taxonomy groups
export const listTaxonomyGroupsSchema = z.object({
  continuation_token: continuationTokenField,
});

// Schema for listing languages
export const listLanguagesSchema = z.object({
  continuation_token: continuationTokenField,
});

// Schema for listing content types
export const listContentTypesSchema = z.object({
  continuation_token: continuationTokenField,
});

// Schema for listing content type snippets
export const listContentTypeSnippetsSchema = z.object({
  continuation_token: continuationTokenField,
});

// Schema for listing assets
export const listAssetsSchema = z.object({
  continuation_token: continuationTokenField,
});

export const listVariantsCollectionSchema = z.object({
  collectionId: z.string().describe("Collection ID"),
  continuation_token: continuationTokenField,
});

export const listVariantsTypeSchema = z.object({
  contentTypeId: z.string().describe("Content type ID"),
  continuation_token: continuationTokenField,
});

export const listVariantsComponentsTypeSchema = z.object({
  contentTypeId: z.string().describe("Content type ID"),
  continuation_token: continuationTokenField,
});

export const listVariantsSpaceSchema = z.object({
  spaceId: z.string().describe("Space ID"),
  continuation_token: continuationTokenField,
});
