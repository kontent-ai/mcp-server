import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const deleteTaxonomyGroup = defineDestructiveTool(
  "delete-taxonomy-group",
  "Delete (remove) Kontent.ai taxonomy group by ID. Removes the category/tag group and all its terms.",
  {
    environmentId: environmentIdSchema,
    id: z.guid().describe("Taxonomy group ID"),
  },
  async ({ environmentId, id }, { authInfo: { token } = {} }) => {
    const client = createMapiClient(environmentId, token);

    try {
      await client.deleteTaxonomy().byTaxonomyId(id).toPromise();

      return createMcpToolSuccessResponse({
        message: `Taxonomy group '${id}' deleted successfully`,
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Taxonomy Group Deletion");
    }
  },
);
