import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const deleteContentTypeMapi = createTool(
  ...defineTool(
    "delete-content-type-mapi",
    "Delete Kontent.ai content type by codename",
    {
      codename: z.string().describe("Content type codename"),
    },
    async ({ codename }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .deleteContentType()
          .byTypeCodename(codename)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type '${codename}' deleted successfully`,
          deletedType: response.rawData,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Content Type Deletion");
      }
    },
  ),
);
