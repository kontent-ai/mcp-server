import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listSpaces = defineReadOnlyTool(
  "list-spaces",
  "List all Kontent.ai spaces. Spaces provide channel-specific site configuration for managing multiple websites/channels. Each space has its own domain and preview URLs; collections connect to spaces to organize content per channel.",
  { environmentId: environmentIdSchema },
  async ({ environmentId }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.listSpaces().toPromise();
      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Spaces Listing");
    }
  },
);
