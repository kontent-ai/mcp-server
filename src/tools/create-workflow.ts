import type { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { workflowInputSchema } from "../schemas/workflowSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createWorkflow = defineAdditiveTool(
  "create-workflow",
  "Create (add) new Kontent.ai workflow with custom steps. Workflows define content lifecycle stages for review and approval.",
  { environmentId: environmentIdSchema, ...workflowInputSchema.shape },
  async (
    {
      environmentId,
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
      const response = await client.addWorkflow().withData(data).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: unknown) {
      return handleMcpToolError(error, "Workflow Creation");
    }
  },
);
