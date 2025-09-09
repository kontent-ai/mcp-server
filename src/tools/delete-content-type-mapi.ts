import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "delete-content-type-mapi",
    "Delete a content type by codename from Management API",
    {
      codename: z.string().describe("Codename of the content type to delete"),
    },
    async ({ codename }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token, config);

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
