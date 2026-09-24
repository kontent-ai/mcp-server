import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listCollections = defineReadOnlyTool(
  "list-collections",
  "List all Kontent.ai collections. Collections organize and group content items by team, brand, or project for access control and content separation.",
  { environmentId: environmentIdSchema },
  async ({ environmentId }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.listCollections().toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Collections Listing");
    }
  },
);
