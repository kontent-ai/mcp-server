import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { spacePatchOperationsSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createUntrustedContentResponse } from "../utils/responseHelper.js";
import { getPatchGuideToolName } from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const patchSpace = defineDestructiveTool(
  "patch-space",
  `Update (modify/edit) Kontent.ai space properties using replace patch operations. Call ${getPatchGuideToolName} first for operations reference.`,
  {
    id: z.guid().describe("Space ID"),
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

      return createUntrustedContentResponse({
        message: `Space updated successfully with ${operations.length} operation(s)`,
        space: response.rawData,
        appliedOperations: operations,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Space Modification");
    }
  },
);
