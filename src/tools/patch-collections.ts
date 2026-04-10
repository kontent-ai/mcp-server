import { createMapiClient } from "../clients/kontentClients.js";
import { collectionPatchOperationsSchema } from "../schemas/collectionSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import {
  getPatchGuideToolName,
  listCollectionsToolName,
} from "./referencedToolNames.js";
import { defineTool } from "./toolDefinition.js";

export const patchCollections = defineTool(
  "patch-collections",
  `Update (modify/edit) Kontent.ai collections using patch operations (addInto, move, rename, remove). Call ${getPatchGuideToolName} first for operations reference.`,
  {
    operations: collectionPatchOperationsSchema.describe(
      `Patch operations array. Call ${listCollectionsToolName} first. Use addInto to add new collections, move to reorder, remove to delete empty collections, replace to rename.`,
    ),
  },
  async ({ operations }, { authInfo: { token, clientId } = {} }) => {
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
