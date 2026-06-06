import type { AssetModels } from "@kontent-ai/management-sdk";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { updateAssetDataSchema } from "../schemas/assetSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createUntrustedContentResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const updateAsset = defineDestructiveTool(
  "update-asset",
  "Update (edit) Kontent.ai asset metadata by ID. Modify asset title, descriptions, or taxonomy-based properties.",
  {
    id: z.guid().describe("Asset ID"),
    data: updateAssetDataSchema,
  },
  async ({ id, data }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .upsertAsset()
        .byAssetId(id)
        .withData(() => data as unknown as AssetModels.IUpsertAssetRequestData)
        .toPromise();

      return createUntrustedContentResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Asset Update");
    }
  },
);
