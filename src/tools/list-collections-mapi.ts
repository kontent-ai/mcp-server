import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listCollectionsMapi = createTool(
  ...defineTool(
    "list-collections-mapi",
    "Get all Kontent.ai collections. Collections organize content items into logical groups by team, brand, or project.",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listCollections().toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Collections Listing");
      }
    },
  ),
);
