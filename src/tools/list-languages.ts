import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { listLanguagesSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { listLanguagesToolName } from "./referencedToolNames.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listLanguages = defineReadOnlyTool(
  listLanguagesToolName,
  "List all Kontent.ai languages (paginated), including inactive ones - check is_active property. Languages define available locales for translations and localization; each can have fallback language for content inheritance.",
  { environmentId: environmentIdSchema, ...listLanguagesSchema.shape },
  async (
    { environmentId, continuation_token },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

    try {
      const query = client.listLanguages();

      const response = await (continuation_token
        ? query.xContinuationToken(continuation_token)
        : query
      ).toPromise();

      return createMcpToolSuccessResponse({
        data: response.rawData.languages,
        pagination: {
          continuation_token: response.data.pagination.continuationToken,
        },
      });
    } catch (error: any) {
      return handleMcpToolError(error, "Languages Listing");
    }
  },
);
