import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const changeVariantWorkflowStep = createTool(
  ...defineTool(
    "change-variant-workflow-step",
    "Move Kontent.ai language variant to a different workflow step. Transition content between lifecycle stages (e.g., draft to review, review to published).",
    {
      itemId: z.guid().describe("Content item ID"),
      languageId: z.guid().describe("Language variant ID"),
      workflowId: z.guid().describe("Workflow ID"),
      workflowStepId: z.guid().describe("Target workflow step ID"),
    },
    async (
      { itemId, languageId, workflowId, workflowStepId },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .changeWorkflowOfLanguageVariant()
          .byItemId(itemId)
          .byLanguageId(languageId)
          .withData({
            workflow_identifier: {
              id: workflowId,
            },
            step_identifier: {
              id: workflowStepId,
            },
          })
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Successfully changed workflow step of language variant '${languageId}' for content item '${itemId}' to workflow step '${workflowStepId}'`,
          result: response.rawData,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Workflow Step Change");
      }
    },
  ),
);
