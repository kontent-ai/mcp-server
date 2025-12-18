import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { workflowInputSchema } from "../schemas/workflowSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-workflow-mapi",
    "Add new Kontent.ai workflow",
    workflowInputSchema.shape,
    async (
      { name, codename, scopes, steps, published_step, archived_step },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

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
};
