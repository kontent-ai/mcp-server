import { createMapiClient } from "../clients/kontentClients.js";
import { environmentIdSchema } from "../schemas/environmentIdSchema.js";
import { listAssetsSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

export const listAssets = defineReadOnlyTool(
  "list-assets",
  "List all Kontent.ai assets (paginated). Assets are digital media files (images, videos, documents, PDFs) referenced in content items.",
  { environmentId: environmentIdSchema, ...listAssetsSchema.shape },
  async (
    { environmentId, continuation_token },
    { authInfo: { token } = {} },
  ) => {
    const client = createMapiClient(environmentId, token);

    try {
      const query = client.listAssets();

      const response = await (continuation_token
        ? query.xContinuationToken(continuation_token)
        : query
      ).toPromise();

      return createMcpToolSuccessResponse({
        data: response.rawData.assets,
        pagination: {
          continuation_token: response.data.pagination.continuationToken,
        },
      });
    } catch (error: any) {
      return handleMcpToolError(error, "Assets Listing");
    }
  },
);
