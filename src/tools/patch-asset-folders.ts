import type { AssetFolderModels } from "@kontent-ai/management-sdk";
import { createMapiClient } from "../clients/kontentClients.js";
import { assetFolderPatchOperationsSchema } from "../schemas/assetFolderSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { getPatchGuideToolName } from "./referencedToolNames.js";
import { defineTool } from "./toolDefinition.js";

export const patchAssetFolders = defineTool(
  "patch-asset-folders",
  `Update (modify/edit) Kontent.ai asset folders using patch operations (addInto, rename, remove). Call ${getPatchGuideToolName} first for operations reference.`,
  {
    operations: assetFolderPatchOperationsSchema,
  },
  async ({ operations }, { authInfo: { token, clientId } = {} }) => {
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
