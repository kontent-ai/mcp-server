import { createMapiClient } from "../clients/kontentClients.js";
import { taxonomyGroupSchemas } from "../schemas/taxonomySchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createUntrustedContentResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const createTaxonomyGroup = defineDestructiveTool(
  "create-taxonomy-group",
  "Create (add) new Kontent.ai taxonomy group for content categorization. Taxonomy groups contain hierarchical terms (categories/tags) for classifying content.",
  taxonomyGroupSchemas,
  async (taxonomyGroup, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

    try {
      const response = await client
        .addTaxonomy()
        .withData(taxonomyGroup)
        .toPromise();

      return createUntrustedContentResponse(response.rawData);
    } catch (error: any) {
      return handleMcpToolError(error, "Taxonomy Group Creation");
    }
  },
);
