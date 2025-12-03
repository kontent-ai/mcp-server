import type { TaxonomyContracts } from "@kontent-ai/management-sdk";
import { z } from "zod";

type TaxonomyTerm = Omit<
  TaxonomyContracts.ITaxonomyContract,
  "id" | "last_modified" | "codename" | "terms"
> & {
  codename?: string;
  terms?: TaxonomyTerm[];
};

// Schema for a taxonomy term
const taxonomyTermSchema: z.ZodType<TaxonomyTerm> = z.object({
  name: z.string(),
  codename: z.string().optional(),
  external_id: z.string().optional(),
  terms: z.lazy(() => z.array(taxonomyTermSchema)).optional(),
});

// Schema for a taxonomy group
export const taxonomyGroupSchemas = {
  name: z.string().describe("Taxonomy group name"),
  codename: z
    .string()
    .optional()
    .describe("Codename (auto-generated if omitted)"),
  external_id: z.string().optional().describe("External ID"),
  terms: z
    .array(taxonomyTermSchema)
    .optional()
    .describe("Taxonomy terms hierarchy"),
} as const;
