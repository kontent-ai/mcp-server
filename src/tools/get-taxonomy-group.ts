import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const getTaxonomyGroup = createTool(
  ...defineTool(
    "get-taxonomy-group",
    "Retrieve Kontent.ai taxonomy group by ID or codename. Taxonomy groups contain hierarchical tree-structured terms (categories/tags) that can be nested to any depth for content categorization.",
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
