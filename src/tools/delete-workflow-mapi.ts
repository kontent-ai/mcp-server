import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-workflow-mapi",
    "Delete Kontent.ai workflow",
    {
      identifier: z.string().describe("Workflow ID (UUID) to delete"),
    },
    async ({ identifier }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .deleteWorkflow()
          .byWorkflowId(identifier)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Workflow '${identifier}' deleted successfully`,
          deletedWorkflow: response.rawData,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Workflow Deletion");
      }
    },
  );
};
