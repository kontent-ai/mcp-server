import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteWorkflow = defineDestructiveTool(
  "delete-workflow",
  "Delete (remove) Kontent.ai workflow. Cannot delete the default workflow.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Workflow ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

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
