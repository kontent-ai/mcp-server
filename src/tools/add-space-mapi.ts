import { createMapiClient } from "../clients/kontentClients.js";
import { addSpaceSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const addSpaceMapi = createTool(
  ...defineTool(
    "add-space-mapi",
    "Add Kontent.ai space",
    addSpaceSchema.shape,
    async (
      { name, codename, collections },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .addSpace()
          .withData({
            name,
            codename,
            collections,
          })
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Space Creation");
      }
    },
  ),
);
