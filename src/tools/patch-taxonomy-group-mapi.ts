import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { taxonomyPatchOperationsSchema } from "../schemas/patchSchemas/taxonomyPatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "patch-taxonomy-group-mapi",
    "Update Kontent.ai taxonomy group using patch operations (addInto, move, remove, replace)",
    {
      id: z.guid(),
      operations: taxonomyPatchOperationsSchema.describe(
        "Patch operations array. Call get-taxonomy-group-mapi first. Use addInto to add terms (with optional reference for parent), move to reorder/nest terms (before/after/under - mutually exclusive), remove to delete terms, replace for name/codename/terms.",
      ),
    },
    async ({ id, operations }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .modifyTaxonomy()
          .byTaxonomyId(id)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Taxonomy group updated with ${operations.length} operation(s)`,
          taxonomyGroup: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Taxonomy Group Patch");
      }
    },
  );
};
