import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-content-type-mapi",
    "Delete Kontent.ai content type by codename",
    {
      codename: z.string().describe("Content type codename"),
    },
    async ({ codename }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .deleteContentType()
          .byTypeCodename(codename)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type '${codename}' deleted successfully`,
          deletedType: response.rawData,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Content Type Deletion");
      }
    },
  );
};
