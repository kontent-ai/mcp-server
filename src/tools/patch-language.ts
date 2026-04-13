import { createMapiClient } from "../clients/kontentClients.js";
import { patchLanguageSchema } from "../schemas/languageSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { getPatchGuideToolName } from "./referencedToolNames.js";
import { defineTool } from "./toolDefinition.js";

export const patchLanguage = defineTool(
  "patch-language",
  `Update (modify/edit) Kontent.ai language properties using replace patch operations. Call ${getPatchGuideToolName} first. Only active languages can be edited - to activate/deactivate, use the Kontent.ai web UI.`,
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
