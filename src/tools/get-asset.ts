import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getAsset = defineReadOnlyTool(
  "get-asset",
  "Retrieve Kontent.ai asset by ID. Assets are digital media files (images, videos, documents, PDFs) standalone, or referenced from other entities, typically content item variants.",
  {
    environmentId: environmentIdSchema,
    assetId: z.guid().describe("Asset ID"),
  },
  async ({ environmentId, assetId }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.viewAsset().byAssetId(assetId).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Asset Retrieval");
    }
  },
);
