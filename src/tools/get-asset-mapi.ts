import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-asset-mapi",
    "Get a specific asset by internal ID from Management API",
    {
      assetId: z.string().describe("Internal ID of the asset to retrieve"),
    },
    async ({ assetId }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .viewAsset()
          .byAssetId(assetId)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Asset Retrieval");
      }
    },
  );
};
