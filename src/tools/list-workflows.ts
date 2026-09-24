import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listWorkflows = defineReadOnlyTool(
  "list-workflows",
  "List all Kontent.ai workflows and their steps. Workflows define content lifecycle stages: draft, review, approval, published, scheduled, archived.",
  { environmentId: environmentIdSchema },
  async ({ environmentId }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.listWorkflows().toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Workflows Listing");
    }
  },
);
