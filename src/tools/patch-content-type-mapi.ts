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
        `Array of patch operations to apply. Supports: 'move' (reorganize elements), 'addInto' (add new elements), 'remove' (delete elements), 'replace' (update existing elements/properties).
        
        ALWAYS CALL get-patch-operations-context-mapi tool first to understand available patch operations and their context.
        ALWAYS CALL get-type-mapi tool before patching to get the latest content type schema.

        RULES:
        - CRITICAL: use addInto/remove patch operations when adding/removing items from arrays in elements properties
        - CRITICAL: use replace patch operation when updating properties of primitive data types and objects
        - CRITICAL: Patch operations that add a URL Slug element with a depends_on reference to a snippet element MUST first ensure the snippet element is present in the content type's elements. If the snippet is not present, it MUST be added before the URL Slug element is added.
        - External_id and type cannot be modified after creation
        - To remove content groups while keeping elements at top level, set ALL elements' content_group to null AND remove ALL content groups in ONE request.`,
      ),
    },
    async ({ codename, operations }) => {
      const client = createMapiClient();

      try {
        // 2. Apply patch operations using the modifyContentType method
        const response = await client
          .modifyContentType()
          .byTypeCodename(codename)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type '${codename}' updated successfully with ${operations.length} operation(s)`,
          contentType: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, `Content Type Patch`);
      }
    },
  );
};
