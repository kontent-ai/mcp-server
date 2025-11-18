import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-asset-mapi",
    "Get Kontent.ai asset by ID",
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
  );
};
