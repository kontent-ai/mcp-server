import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { snippetPatchOperationsSchema } from "../schemas/patchSchemas/snippetPatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "patch-type-snippet-mapi",
    "Update Kontent.ai content type snippet using JSON Patch (move, addInto, remove, replace)",
    {
      codename: z.string(),
      operations: snippetPatchOperationsSchema.describe(
        `Patch operations array. CRITICAL: Always call get-type-snippet-mapi first.
- Use addInto/remove for arrays, replace for primitives/objects
- Snippets cannot contain: content_groups, subpages, snippet, or url_slug elements`,
      ),
    },
    async (
      { codename, operations },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .modifyContentTypeSnippet()
          .byTypeCodename(codename)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type snippet '${codename}' updated successfully with ${operations.length} operation(s)`,
          snippet: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Content Type Snippet Patch");
      }
    },
  );
};
