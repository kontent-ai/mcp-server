import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { patchOperationsSchema } from "../schemas/patchSchemas/contentTypePatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "patch-content-type-mapi",
    "Update Kontent.ai content type using patch operations. Call get-patch-guide first for operations reference.",
    {
      id: z.guid(),
      operations: patchOperationsSchema.describe(
        `Patch operations array. CRITICAL: Always call get-type-mapi first.
- Use addInto/remove for arrays, replace for primitives/objects
- Only one url_slug element allowed per content type
- To remove content groups: set ALL elements' content_group to null AND remove ALL groups in one request
- URL slug with snippet: add snippet element first, then url_slug with depends_on reference`,
      ),
    },
    async ({ id, operations }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        // Apply patch operations using the modifyContentType method
        const response = await client
          .modifyContentType()
          .byTypeId(id)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type updated successfully with ${operations.length} operation(s)`,
          contentType: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, `Content Type Patch`);
      }
    },
  );
};
