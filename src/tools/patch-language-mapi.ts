import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { patchLanguageSchema } from "../schemas/languageSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "patch-language-mapi",
    "Update Kontent.ai language using replace operations via Management API. Only active languages can be modified - if deactivated, is_active: true must be first operation.",
    patchLanguageSchema.shape,
    async (
      { languageId, operations },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .modifyLanguage()
          .byLanguageId(languageId)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Language updated with ${operations.length} operation(s)`,
          language: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, "Language Patch");
      }
    },
  );
};
