import { createMapiClient } from "../clients/kontentClients.js";
import { addLanguageSchema } from "../schemas/languageSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { createTool, defineTool } from "./toolDefinition.js";

export const addLanguage = createTool(
  ...defineTool(
    "add-language",
    "Create new Kontent.ai language for translations and localization. Languages are always created as active.",
    addLanguageSchema.shape,
    async (
      { name, codename, fallback_language, external_id },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token);

      try {
        const response = await client
          .addLanguage()
          .withData({
            name,
            codename,
            is_active: true,
            fallback_language,
            external_id,
          })
          .toPromise();

        return createMcpToolSuccessResponse(response.rawData);
      } catch (error: unknown) {
        return handleMcpToolError(error, "Language Creation");
      }
    },
  ),
);
