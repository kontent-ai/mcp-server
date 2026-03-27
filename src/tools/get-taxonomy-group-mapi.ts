import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const getTaxonomyGroupMapi = createTool(
  ...defineTool(
    "get-taxonomy-group-mapi",
    "Get Kontent.ai taxonomy group. Taxonomy groups are hierarchical with tree-structured terms that can be nested to any depth for flexible content categorization.",
    {
      id: z.guid(),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .getTaxonomy()
          .byTaxonomyId(id)
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: any) {
        return handleMcpToolError(error, "Taxonomy Group Retrieval");
      }
    },
  ),
);
