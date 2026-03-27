import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const listRolesMapi = createTool(
  ...defineTool(
    "list-roles-mapi",
    "Get all Kontent.ai roles",
    {},
    async (_, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client.listRoles().toPromise();

        return createMcpToolSuccessResponse(response.rawData.roles);
      } catch (error: any) {
        return handleMcpToolError(error, "Roles Listing");
      }
    },
  ),
);
