import type { TaxonomyContracts } from "@kontent-ai/management-sdk";
import { z } from "zod";

type TaxonomyTerm = Omit<
  TaxonomyContracts.ITaxonomyContract,
  "id" | "last_modified" | "codename" | "terms"
> & {
  codename?: string;
  terms: TaxonomyTerm[];
};

// Schema for a taxonomy term
const taxonomyTermSchema: z.ZodType<TaxonomyTerm> = z.object({
  name: z.string(),
  codename: z.string().optional(),
  external_id: z.string().optional(),
  terms: z.lazy(() => z.array(taxonomyTermSchema)),
});

// Schema for a taxonomy group
export const taxonomyGroupSchemas = {
  name: z.string().describe("Display name of the taxonomy group"),
  codename: z
    .string()
    .optional()
    .describe(
      "Codename of the taxonomy group (optional, will be generated if not provided)",
    ),
  external_id: z
    .string()
    .optional()
    .describe("External ID of the taxonomy group (optional)"),
  terms: z
    .string()
    .describe(
      'JSON string representing the hierarchical structure of taxonomy terms. Each term should have \'name\' and \'terms\' array for nested terms. Example: \'[{"name": "Technology", "terms": [{"name": "Web Development", "terms": []}]}]\'',
    ),
} as const;
