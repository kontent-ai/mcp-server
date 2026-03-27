import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { patchOperationsSchema } from "../schemas/patchSchemas/contentTypePatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const patchContentType = defineTool(
  "patch-content-type",
  "Modify Kontent.ai content type schema using patch operations (add, move, remove, replace elements/fields). Add new fields, rearrange or remove existing elements. Call get-patch-guide first for operations reference.",
  {
    id: z.guid(),
    operations: patchOperationsSchema.describe(
      `Patch operations array. CRITICAL: Always call get-content-type first.
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
