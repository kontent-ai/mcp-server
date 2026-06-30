import { createMapiClient } from "../clients/kontentClients.js";
import { coerceJsonString } from "../schemas/coerceJsonString.js";
import { collectionPatchOperationsSchema } from "../schemas/collectionSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  getPatchGuideToolName,
  listCollectionsToolName,
  patchGuideIdParam,
} from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const patchCollections = defineDestructiveTool(
  "patch-collections",
  `Update (modify/edit) Kontent.ai collections using patch operations. Always call ${getPatchGuideToolName}(entityType='collection') first — it documents constraints not visible in this schema that the API enforces.`,
  {
    ...patchGuideIdParam("collection"),
    operations: coerceJsonString(
      collectionPatchOperationsSchema.describe(
        `Patch operations array. Call ${listCollectionsToolName} first. Use addInto to add new collections, move to reorder, remove to delete empty collections, replace to rename.`,
      ),
    ),
  },
  async ({ patchGuideId: _patchGuideId, operations }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .setCollections()
        .withData(operations)
        .toPromise();

      return createMcpToolSuccessResponse({
        message: `Collections updated successfully with ${operations.length} operation(s)`,
        collections: response.rawData,
        appliedOperations: operations,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Collections Patch");
    }
  },
);
