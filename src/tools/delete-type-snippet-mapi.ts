import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "delete-type-snippet-mapi",
    "Delete Kontent.ai content type snippet by codename",
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
  );
};
