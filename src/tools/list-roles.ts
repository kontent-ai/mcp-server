import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listRoles = defineReadOnlyTool(
  "list-roles",
  "List all Kontent.ai roles. Roles define user permissions and access control within the environment.",
  { environmentId: environmentIdSchema },
  async ({ environmentId }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.listRoles().toPromise();

      return createMcpToolSuccessResponse(response.rawData.roles);
    } catch (error: any) {
      return handleMcpToolError(error, "Roles Listing");
    }
  },
);
