import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { spacePatchOperationsSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "modify-space-mapi",
    "Modify Kontent.ai space using replace operations from Management API",
    {
      spaceId: z.string(),
      operations: spacePatchOperationsSchema,
    },
    async ({ spaceId, operations }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .modifySpace()
          .bySpaceId(spaceId)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Space updated successfully with ${operations.length} operation(s)`,
          space: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Space Modification");
      }
    },
  );
};
