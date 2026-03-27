import { createMapiClient } from "../clients/kontentClients.js";
import { taxonomyGroupSchemas } from "../schemas/taxonomySchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const addTaxonomyGroupMapi = createTool(
  ...defineTool(
    "add-taxonomy-group-mapi",
    "Add new Kontent.ai taxonomy group",
    taxonomyGroupSchemas,
    async (taxonomyGroup, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .addTaxonomy()
          .withData(taxonomyGroup)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Group Creation");
      }
    },
  ),
);
