import { z } from "zod";
import { getPatchGuideToolName } from "../../tools/referencedToolNames.js";

/**
 * Produces the patchGuideId schema field for a given entity type.
 * Include this in the inputSchema of every patch-* tool so the model must
 * supply the patchGuideId returned by its get-patch-guide call for that
 * entity — this works the same regardless of which model/client is calling,
 * unlike relying on a model-specific tool-call ID.
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
  patchGuideId: z
    .string()
    .describe(
      `The patchGuideId value returned by the ${getPatchGuideToolName}(entityType='${entityType}') tool result in this conversation. ` +
        `Call ${getPatchGuideToolName}(entityType='${entityType}') first if you have not done so, then copy the patchGuideId it returned here — ` +
        "this confirms you received and read the patch guide before constructing operations.",
    ),
});
