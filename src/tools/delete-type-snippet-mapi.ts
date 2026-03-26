import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const deleteTypeSnippetMapi = createTool(
  ...defineTool(
    "delete-type-snippet-mapi",
    "Delete (remove) Kontent.ai content type snippet by codename. Removes the reusable shared element set definition.",
    {
      codename: z.string(),
    },
    async ({ codename }, { authInfo: { token, clientId } = {} }) => {
      const client = createMapiClient(clientId, token);

      try {
        await client
          .deleteContentTypeSnippet()
          .byTypeCodename(codename)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type snippet '${codename}' deleted successfully`,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Content Type Snippet Deletion");
      }
    },
  ),
);
