import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { addLanguageSchema } from "../schemas/languageSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineAdditiveTool } from "./toolDefinition.js";

export const createLanguage = defineAdditiveTool(
  "create-language",
  "Create (add) and configure new Kontent.ai language locale for translations and localization. Languages are always created as active.",
  { environmentId: environmentIdSchema, ...addLanguageSchema.shape },
  async (
    { environmentId, name, codename, fallback_language, external_id },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

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
);
