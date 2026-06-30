import type { AssetFolderModels } from "@kontent-ai/management-sdk";
import { createMapiClient } from "../clients/kontentClients.js";
import { assetFolderPatchOperationsSchema } from "../schemas/assetFolderSchemas.js";
import { coerceJsonString } from "../schemas/coerceJsonString.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { getPatchGuideToolName, patchGuideIdParam } from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const patchAssetFolders = defineDestructiveTool(
  "patch-asset-folders",
  `Update (modify/edit) Kontent.ai asset folders using patch operations. Always call ${getPatchGuideToolName}(entityType='asset-folder') first — it documents constraints not visible in this schema that the API enforces.`,
  {
    ...patchGuideIdParam("asset-folder"),
    operations: coerceJsonString(assetFolderPatchOperationsSchema),
  },
  async ({ patchGuideId: _patchGuideId, operations }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .modifyAssetFolders()
        .withData(operations as AssetFolderModels.IModifyAssetFolderData[])
        .toPromise();

      return createMcpToolSuccessResponse({
        message: `Asset folders modified with ${operations.length} operation(s)`,
        folders: response.rawData,
        appliedOperations: operations,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Asset Folders Modification");
    }
  },
);
