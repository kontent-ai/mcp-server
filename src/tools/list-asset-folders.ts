import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const listAssetFolders = defineTool(
  "list-asset-folders",
  "List all Kontent.ai asset folders. Folders organize digital media files (images, videos, documents) into a hierarchical directory structure.",
  {},
  async (_params, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client.listAssetFolders().toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Asset Folders Listing");
    }
  },
);
