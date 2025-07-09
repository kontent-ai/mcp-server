import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "change-variant-workflow-step-mapi",
    "Change the workflow step of a language variant in Kontent.ai. This operation moves a language variant to a different step in the workflow, enabling content lifecycle management such as moving content from draft to review, review to published, etc.",
    {
      itemId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the content item whose language variant workflow step you want to change",
        ),
      languageId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the language variant. Use '00000000-0000-0000-0000-000000000000' for the default language",
        ),
      workflowId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the workflow. This is the workflow that contains the target step",
        ),
      workflowStepId: z
        .string()
        .uuid()
        .describe(
          "Internal ID (UUID) of the target workflow step. This must be a valid step ID from the specified workflow. Common steps include Draft, Review, Published, and Archived, but the actual IDs depend on your specific workflow configuration",
        ),
    },
    async ({ itemId, languageId, workflowId, workflowStepId }) => {
      const client = createMapiClient();

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
          result: response.data,
        });
      } catch (error: any) {
        return handleMcpToolError(error, "Workflow Step Change");
      }
    },
  );
};
