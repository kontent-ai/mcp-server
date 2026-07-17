import { z } from "zod";
import { writeReferenceObjectSchema } from "../referenceObjectSchema.js";

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

const addIntoBaseSchema = {
  op: z.literal("addInto"),
  reference: writeReferenceObjectSchema
    .optional()
    .describe(
      "Parent term reference. Omit to add at root level of taxonomy group.",
    ),
  value: taxonomyTermValueSchema,
};

const addIntoBeforeOperationSchema = z.object({
  ...addIntoBaseSchema,
  before: writeReferenceObjectSchema.describe(
    "Reference to the sibling term to insert before.",
  ),
});

const addIntoAfterOperationSchema = z.object({
  ...addIntoBaseSchema,
  after: writeReferenceObjectSchema.describe(
    "Reference to the sibling term to insert after.",
  ),
});

const addIntoDefaultOperationSchema = z.object(addIntoBaseSchema);

const moveBaseSchema = {
  op: z.literal("move"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the term to move.",
  ),
};

const moveBeforeOperationSchema = z.object({
  ...moveBaseSchema,
  before: writeReferenceObjectSchema.describe(
    "Reference to the sibling term to move before.",
  ),
});

const moveAfterOperationSchema = z.object({
  ...moveBaseSchema,
  after: writeReferenceObjectSchema.describe(
    "Reference to the sibling term to move after.",
  ),
});

const moveUnderOperationSchema = z.object({
  ...moveBaseSchema,
  under: writeReferenceObjectSchema.describe(
    "Move as child of this term (tree nesting)",
  ),
});

const removeOperationSchema = z.object({
  op: z.literal("remove"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the term to remove.",
  ),
});

const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  reference: writeReferenceObjectSchema
    .optional()
    .describe(
      "Term reference. Omit when modifying group-level properties (name, codename). Required when modifying specific term.",
    ),
  property_name: z.enum(["name", "codename", "terms"]),
  value: z
    .union([z.string(), z.array(taxonomyTermValueSchema)])
    .describe("New value. String for name/codename, array for terms."),
});

export const taxonomyPatchOperationSchema = z.union([
  addIntoBeforeOperationSchema,
  addIntoAfterOperationSchema,
  addIntoDefaultOperationSchema,
  moveBeforeOperationSchema,
  moveAfterOperationSchema,
  moveUnderOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

export const taxonomyPatchOperationsSchema = z
  .array(taxonomyPatchOperationSchema)
  .min(1);
