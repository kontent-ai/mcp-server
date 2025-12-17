import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "change-variant-workflow-step-mapi",
    "Change Kontent.ai variant workflow step",
    {
      itemId: z.guid().describe("Content item UUID"),
      languageId: z
        .guid()
        .describe(
          "Language variant UUID (default: 00000000-0000-0000-0000-000000000000)",
        ),
      workflowId: z.guid().describe("Workflow UUID"),
      workflowStepId: z.guid().describe("Target workflow step UUID"),
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
  );
};
