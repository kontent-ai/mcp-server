import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const getAsset = defineTool(
  "get-asset",
  "Retrieve Kontent.ai asset by ID. Assets are digital media files (images, videos, documents, PDFs) standalone, or referenced from other entities, typically content item variants.",
  {
    assetId: z.string().describe("Asset ID"),
  },
  async ({ assetId }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client.viewAsset().byAssetId(assetId).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Asset Retrieval");
    }
  },
);
