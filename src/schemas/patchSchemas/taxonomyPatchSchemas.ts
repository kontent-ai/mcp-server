import { z } from "zod";
import { referenceObjectSchema } from "../referenceObjectSchema.js";

type TaxonomyTermValue = {
  name: string;
  codename?: string;
  external_id?: string;
  terms?: TaxonomyTermValue[];
};

const taxonomyTermValueSchema: z.ZodType<TaxonomyTermValue> = z.object({
  name: z.string(),
  codename: z.string().optional(),
  external_id: z.string().optional(),
  terms: z.lazy(() => z.array(taxonomyTermValueSchema)).optional(),
});

const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  reference: referenceObjectSchema
    .optional()
    .describe(
      "Parent term reference. Omit to add at root level of taxonomy group.",
    ),
  value: taxonomyTermValueSchema,
  before: referenceObjectSchema
    .optional()
    .describe("Position before this term. Mutually exclusive with 'after'."),
  after: referenceObjectSchema
    .optional()
    .describe("Position after this term. Mutually exclusive with 'before'."),
});

const moveOperationSchema = z.object({
  op: z.literal("move"),
  reference: referenceObjectSchema,
  before: referenceObjectSchema
    .optional()
    .describe(
      "Move before this term (same level). Mutually exclusive with 'after' and 'under'.",
    ),
  after: referenceObjectSchema
    .optional()
    .describe(
      "Move after this term (same level). Mutually exclusive with 'before' and 'under'.",
    ),
  under: referenceObjectSchema
    .optional()
    .describe(
      "Move as child of this term (tree nesting). Mutually exclusive with 'before' and 'after'.",
    ),
});

const removeOperationSchema = z.object({
  op: z.literal("remove"),
  reference: referenceObjectSchema,
});

const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  reference: referenceObjectSchema
    .optional()
    .describe(
      "Term reference. Omit when modifying group-level properties (name, codename). Required when modifying specific term.",
    ),
  property_name: z.enum(["name", "codename", "terms"]),
  value: z
    .union([z.string(), z.array(taxonomyTermValueSchema)])
    .describe("New value. String for name/codename, array for terms."),
});

export const taxonomyPatchOperationSchema = z.discriminatedUnion("op", [
  addIntoOperationSchema,
  moveOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

export const taxonomyPatchOperationsSchema = z
  .array(taxonomyPatchOperationSchema)
  .min(1);
