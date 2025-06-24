import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-asset-mapi",
    "Get a specific asset by codename from Management API",
    {
      assetCodename: z.string().describe("Codename of the asset to retrieve"),
    },
    async ({ assetCodename }) => {
      const client = createMapiClient();

      try {
        const response = await client
          .viewAsset()
          .byAssetCodename(assetCodename)
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        return handleMcpToolError(error, "Asset Retrieval");
      }
    },
  );
};
