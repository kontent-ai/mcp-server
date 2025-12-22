import type { AssetFolderModels } from "@kontent-ai/management-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { assetFolderPatchOperationsSchema } from "../schemas/assetFolderSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "patch-asset-folders-mapi",
    "Modify Kontent.ai asset folders using patch operations (addInto, rename, remove). Call get-patch-guide first for operations reference.",
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
};
