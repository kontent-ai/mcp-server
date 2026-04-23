import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const listWorkflows = defineTool(
  "list-workflows",
  "List all Kontent.ai workflows and their steps. Workflows define content lifecycle stages: draft, review, approval, published, scheduled, archived.",
  {},
  async (_, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client.listWorkflows().toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Workflows Listing");
    }
  },
);
