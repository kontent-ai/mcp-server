import { z } from "zod";
import { writeReferenceObjectSchema } from "./referenceObjectSchema.js";

type AssetFolderValue = {
  name: string;
  codename?: string;
  external_id?: string;
  folders?: AssetFolderValue[];
};

const assetFolderValueSchema: z.ZodType<AssetFolderValue> = z.object({
  name: z.string(),
  codename: z.string().optional(),
  external_id: z.string().optional(),
  folders: z.lazy(() => z.array(assetFolderValueSchema)).optional(),
});

const addIntoBaseSchema = {
  op: z.literal("addInto"),
  reference: writeReferenceObjectSchema
    .optional()
    .describe("Parent folder reference. Omit to add at root level."),
  value: assetFolderValueSchema,
};

const addIntoBeforeOperationSchema = z.object({
  ...addIntoBaseSchema,
  before: writeReferenceObjectSchema.describe(
    "Reference to the sibling folder to insert before.",
  ),
});

const addIntoAfterOperationSchema = z.object({
  ...addIntoBaseSchema,
  after: writeReferenceObjectSchema.describe(
    "Reference to the sibling folder to insert after.",
  ),
});

const addIntoDefaultOperationSchema = z.object(addIntoBaseSchema);

const renameOperationSchema = z.object({
  op: z.literal("rename"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the folder to rename.",
  ),
  value: z.string(),
});

const removeOperationSchema = z.object({
  op: z.literal("remove"),
  reference: writeReferenceObjectSchema.describe(
    "Reference to the folder to remove.",
  ),
});

const assetFolderPatchOperationSchema = z.union([
  addIntoBeforeOperationSchema,
  addIntoAfterOperationSchema,
  addIntoDefaultOperationSchema,
  renameOperationSchema,
  removeOperationSchema,
]);

export const assetFolderPatchOperationsSchema = z
  .array(assetFolderPatchOperationSchema)
  .min(1)
  .describe(
    "Patch operations array. Use addInto to add new folders (with optional reference for parent, before/after for positioning), rename to change folder names, remove to delete folders.",
  );
