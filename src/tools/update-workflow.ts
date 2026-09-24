import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { workflowInputSchema } from "../schemas/workflowSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const updateWorkflow = defineDestructiveTool(
  "update-workflow",
  "Update (edit) Kontent.ai workflow steps, transitions, and settings. Modify content lifecycle stages.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Workflow ID"),
    ...workflowInputSchema.shape,
  },
  async (
    {
      environmentId,
      id,
      name,
      codename,
      scopes,
      steps,
      published_step,
      archived_step,
    },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

    const data: z.infer<typeof workflowInputSchema> = {
      name,
      codename,
      scopes,
      steps,
      published_step,
      archived_step,
    };

    try {
      const response = await client
        .updateWorkflow()
        .byWorkflowId(id)
        .withData(data)
        .toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Workflow Update");
    }
  },
);
