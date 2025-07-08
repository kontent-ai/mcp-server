import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { patchOperationsSchema } from "../schemas/patchSchemas/contentTypePatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "patch-content-type-mapi",
    "Update an existing content type by codename via Management API. Supports move, addInto, remove, and replace operations following RFC 6902 JSON Patch specification.",
    {
      codename: z.string().describe("Codename of the content type to update"),
      operations: patchOperationsSchema.describe(
        `Array of patch operations to apply. Supports: 'move' (reorganize elements), 'addInto' (add new elements / values into arrays in existing elements), 'remove' (delete elements / values from arrays in existing elements), 'replace' (update existing basic properties (name, codename,..)).
        
        RULES:
        - CRITICAL: Replace operations CANNOT (YOU CAN'T USE THEM) modify individual array items for element properties - use addInto/remove instead
          - If you need want allow everything, remove limitations until array is empty.
        - External_id and type cannot be modified after creation
        - To remove content groups while keeping elements at top level, set ALL elements' content_group to null AND remove ALL content groups in ONE request.`
      ),
    },
    async ({ codename, operations }) => {
      const client = createMapiClient();

      try {
        // 1. Verify content type exists by fetching it first
        const existingContentType = await client
          .viewContentType()
          .byTypeCodename(codename)
          .toPromise();

        // 2. Apply patch operations using the modifyContentType method
        const response = await client
          .modifyContentType()
          .byTypeCodename(existingContentType.rawData.codename)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type '${codename}' updated successfully with ${operations.length} operation(s)`,
          contentType: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Content Type Patch");
      }
    },
  );
}; 