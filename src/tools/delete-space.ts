import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteSpace = defineDestructiveTool(
  "delete-space",
  "Delete (remove) Kontent.ai space by ID. Removes the channel/website context.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Space ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      await client.deleteSpace().bySpaceId(id).toPromise();

      return createMcpToolSuccessResponse({
        message: `Space '${id}' deleted successfully`,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Space Deletion");
    }
  },
);
