import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { snippetPatchOperationsSchema } from "../schemas/patchSchemas/snippetPatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const patchContentTypeSnippet = defineTool(
  "patch-content-type-snippet",
  "Modify Kontent.ai content type snippet using patch operations (move, addInto, remove, replace elements). Call get-patch-guide first for operations reference.",
  {
    id: z.guid(),
    operations: snippetPatchOperationsSchema.describe(
      `Patch operations array. CRITICAL: Always call get-content-type-snippet first.
- Use addInto/remove for arrays, replace for primitives/objects
- Snippets cannot contain: content_groups, snippet, or url_slug elements`,
    ),
  },
  async ({ id, operations }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .modifyContentTypeSnippet()
        .byTypeId(id)
        .withData(operations)
        .toPromise();

      return createMcpToolSuccessResponse({
        message: `Content type snippet updated successfully with ${operations.length} operation(s)`,
        snippet: response.rawData,
        appliedOperations: operations,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Type Snippet Patch");
    }
  },
);
