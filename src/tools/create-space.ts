import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { addSpaceSchema } from "../schemas/spaceSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createSpace = defineAdditiveTool(
  "create-space",
  "Create (add) new Kontent.ai space for managing a website or channel. Spaces provide channel-specific context with their own domain and preview URLs.",
  { environmentId: environmentIdSchema, ...addSpaceSchema.shape },
  async (
    { environmentId, name, codename, collections },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

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
