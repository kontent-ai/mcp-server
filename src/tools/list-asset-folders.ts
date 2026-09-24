import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listAssetFolders = defineReadOnlyTool(
  "list-asset-folders",
  "List all Kontent.ai asset folders. Folders organize digital media files (images, videos, documents) into a hierarchical directory structure.",
  { environmentId: environmentIdSchema },
  async ({ environmentId }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.listAssetFolders().toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Asset Folders Listing");
    }
  },
);
