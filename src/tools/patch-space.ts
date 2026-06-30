import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { coerceJsonString } from "../schemas/coerceJsonString.js";
import { spacePatchOperationsSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { getPatchGuideToolName, patchGuideIdParam } from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const patchSpace = defineDestructiveTool(
  "patch-space",
  `Update (modify/edit) Kontent.ai space properties using replace patch operations. Call ${getPatchGuideToolName} first for operations reference.`,
  {
    ...patchGuideIdParam("space"),
    id: z.guid().describe("Space ID"),
    operations: coerceJsonString(spacePatchOperationsSchema),
  },
  async ({ patchGuideId: _patchGuideId, id, operations }, { authInfo: { token, clientId } = {} }) => {
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
);
