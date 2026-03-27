import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const deleteWorkflow = defineTool(
  "delete-workflow",
  "Delete (remove) Kontent.ai workflow. Cannot delete the default workflow.",
  {
    id: z.guid().describe("Workflow ID"),
  },
  async ({ id }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      await client.deleteWorkflow().byWorkflowId(id).toPromise();

      return createMcpToolSuccessResponse({
        message: `Workflow '${id}' deleted successfully`,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Workflow Deletion");
    }
  },
);
