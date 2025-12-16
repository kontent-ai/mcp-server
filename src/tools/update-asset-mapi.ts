import type { AssetModels } from "@kontent-ai/management-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { updateAssetDataSchema } from "../schemas/assetSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "upsert-asset-mapi",
    "Create or update Kontent.ai asset by ID",
    {
      assetId: z.string(),
      data: updateAssetDataSchema,
    },
    async ({ assetId, data }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .upsertAsset()
          .byAssetId(assetId)
          .withData(
            () => data as unknown as AssetModels.IUpsertAssetRequestData,
          )
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Asset Upsert");
      }
    },
  );
};
