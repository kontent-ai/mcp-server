import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const getTaxonomyGroup = defineReadOnlyTool(
  "get-taxonomy-group",
  "Retrieve Kontent.ai taxonomy group by ID or codename. Taxonomy groups provide a classification hierarchy of tree-structured terms (categories/tags) that can be nested to any depth for content categorization.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Taxonomy group ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      const response = await client.getTaxonomy().byTaxonomyId(id).toPromise();

      return createMcpToolSuccessResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Taxonomy Group Retrieval");
    }
  },
);
