import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { spacePatchOperationsSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const patchSpace = createTool(
  ...defineTool(
    "patch-space",
    "Update Kontent.ai space properties using replace patch operations. Call get-patch-guide first for operations reference.",
    {
      id: z.guid(),
      operations: spacePatchOperationsSchema,
    },
    async ({ id, operations }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .modifySpace()
          .bySpaceId(id)
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
  ),
);
