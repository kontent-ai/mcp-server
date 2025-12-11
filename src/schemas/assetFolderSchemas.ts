import { z } from "zod";
import { referenceObjectSchema } from "./referenceObjectSchema.js";

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

const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  reference: referenceObjectSchema
    .optional()
    .describe("Parent folder reference. Omit to add at root level."),
  value: assetFolderValueSchema.describe("Folder data to add"),
  before: referenceObjectSchema
    .optional()
    .describe("Position before this folder. Mutually exclusive with 'after'."),
  after: referenceObjectSchema
    .optional()
    .describe("Position after this folder. Mutually exclusive with 'before'."),
});

const renameOperationSchema = z.object({
  op: z.literal("rename"),
  reference: referenceObjectSchema.describe("Folder to rename"),
  value: z.string().describe("New folder name"),
});

const removeOperationSchema = z.object({
  op: z.literal("remove"),
  reference: referenceObjectSchema.describe("Folder to remove"),
});

export const assetFolderPatchOperationSchema = z.discriminatedUnion("op", [
  addIntoOperationSchema,
  renameOperationSchema,
  removeOperationSchema,
]);

export const assetFolderPatchOperationsSchema = z
  .array(assetFolderPatchOperationSchema)
  .min(1);
