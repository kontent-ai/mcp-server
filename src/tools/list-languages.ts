import { createMapiClient } from "../clients/kontentClients.js";
import { listLanguagesSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineTool } from "./toolDefinition.js";

export const listLanguages = defineTool(
  "list-languages",
  "List all Kontent.ai languages (paginated), including inactive ones - check is_active property. Languages define available locales for translations and localization; each can have fallback language for content inheritance.",
  listLanguagesSchema.shape,
  async ({ continuation_token }, { authInfo: { token, clientId } = {} }) => {
    const client = createMapiClient(clientId, token);

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
