import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const deleteSpaceMapi = createTool(
  ...defineTool(
    "delete-space-mapi",
    "Delete (remove) Kontent.ai space by ID. Removes the channel/website context.",
    {
      id: z.guid(),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        await client.deleteSpace().bySpaceId(id).toPromise();

        return createMcpToolSuccessResponse({
          message: `Space '${id}' deleted successfully`,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Space Deletion");
      }
    },
  ),
);
