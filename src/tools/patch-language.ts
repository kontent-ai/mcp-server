import { createMapiClient } from "../clients/kontentClients.js";
import { patchLanguageSchema } from "../schemas/languageSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { getPatchGuideToolName, patchGuideIdParam } from "./referencedToolNames.js";
import { defineDestructiveTool } from "./toolDefinition.js";

export const patchLanguage = defineDestructiveTool(
  "patch-language",
  `Update (modify/edit) Kontent.ai language properties using replace patch operations. Always call ${getPatchGuideToolName}(entityType='language') first — it documents constraints and available properties not visible in this schema.`,
  {
    ...patchGuideIdParam("language"),
    ...patchLanguageSchema.shape,
  },
  async (
    { patchGuideId: _patchGuideId, languageId, operations },
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
