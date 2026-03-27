import { createMapiClient } from "../clients/kontentClients.js";
import { addSpaceSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const addSpace = defineTool(
  "add-space",
  "Create new Kontent.ai space for managing a website or channel. Spaces provide channel-specific context with their own domain and preview URLs.",
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
);
