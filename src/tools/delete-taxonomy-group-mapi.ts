import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const deleteTaxonomyGroupMapi = createTool(
  ...defineTool(
    "delete-taxonomy-group-mapi",
    "Delete (remove) Kontent.ai taxonomy group by ID. Removes the category/tag group and all its terms.",
    {
      id: z.guid(),
    },
    async ({ id }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        await client.deleteTaxonomy().byTaxonomyId(id).toPromise();

        return createMcpToolSuccessResponse({
          message: `Taxonomy group '${id}' deleted successfully`,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Taxonomy Group Deletion");
      }
    },
  ),
);
