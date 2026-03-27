import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const getAssetMapi = createTool(
  ...defineTool(
    "get-asset-mapi",
    "Get Kontent.ai asset. Assets are digital files (images, videos, documents) referenced in content.",
    {
      assetId: z.string().describe("Asset ID"),
    },
    async ({ assetId }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .viewAsset()
          .byAssetId(assetId)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Asset Retrieval");
      }
    },
  ),
);
