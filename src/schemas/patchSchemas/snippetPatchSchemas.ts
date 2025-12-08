import { z } from "zod";
import { snippetElementSchema } from "../contentTypeAndSnippetSchemas.js";
import {
  moveOperationSchema,
  removeOperationSchema,
  sharedAddIntoValueSchemas,
  sharedReplaceValueSchemas,
} from "./baseTypeAndSnippetPatchSchemas.js";

const addIntoOperationSchema = z.object({
  op: z.literal("addInto"),
  path: z.string().describe("Path where to add item (format: id:{uuid})"),
  value: z.union([snippetElementSchema, ...sharedAddIntoValueSchemas]),
});

const replaceOperationSchema = z.object({
  op: z.literal("replace"),
  path: z.string().describe("Path to property to replace (format: id:{uuid})"),
  value: z.union(sharedReplaceValueSchemas),
});

export const snippetPatchOperationSchema = z.discriminatedUnion("op", [
  moveOperationSchema,
  addIntoOperationSchema,
  removeOperationSchema,
  replaceOperationSchema,
]);

export const snippetPatchOperationsSchema = z
  .array(snippetPatchOperationSchema)
  .min(1);
