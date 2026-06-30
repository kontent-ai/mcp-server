import { z } from "zod";

// Tools whose names are referenced by other tools
export const searchContentItemVariantsToolName = "search-content-item-variants";
export const listContentItemVariantsToolName = "list-content-item-variants";
export const bulkGetContentItemVariantsToolName =
  "bulk-get-content-item-variants";
export const createContentItemToolName = "create-content-item";
export const createContentItemVariantToolName = "create-content-item-variant";
export const updateContentItemVariantToolName = "update-content-item-variant";
export const getPatchGuideToolName = "get-patch-guide";
export const getTaxonomyGroupToolName = "get-taxonomy-group";
export const listCollectionsToolName = "list-collections";
export const listLanguagesToolName = "list-languages";

/**
 * Produces the patchGuideId schema field for a given entity type.
 * Include this in the inputSchema of every patch-* tool so the model must
 * supply the tool call ID from its get-patch-guide invocation for that entity.
 */
export const patchGuideIdParam = (
  entityType:
    | "content-type"
    | "snippet"
    | "taxonomy"
    | "collection"
    | "asset-folder"
    | "space"
    | "language",
) => ({
  patchGuideId: z.string().describe(
    `The tool_use_id from the ${getPatchGuideToolName}(entityType='${entityType}') tool result in this conversation. ` +
      `Find the tool_result block for ${getPatchGuideToolName} in your context and pass its tool_use_id here — ` +
      "this confirms you received and read the patch guide before constructing operations. " +
      `Call ${getPatchGuideToolName}(entityType='${entityType}') first if you have not done so.`,
  ),
});
