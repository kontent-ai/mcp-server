import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { taxonomyGroupSchemas } from "../schemas/taxonomySchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createTaxonomyGroup = defineAdditiveTool(
  "create-taxonomy-group",
  "Create (add) new Kontent.ai taxonomy group for content categorization. Taxonomy groups contain hierarchical terms (categories/tags) for classifying content.",
  { ...taxonomyGroupSchemas, environmentId: environmentIdSchema },
  async ({ environmentId, ...taxonomyGroup }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

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
);
