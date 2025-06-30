import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { taxonomyGroupSchemas } from "../schemas/taxonomySchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "add-taxonomy-group-mapi",
    "Add a new taxonomy group via Management API",
    taxonomyGroupSchemas,
    async ({ name, codename, external_id, terms }) => {
      const client = createMapiClient();

      try {
        // Parse JSON string
        const parsedTerms = JSON.parse(terms);

        const response = await client
          .addTaxonomy()
          .withData({
            name,
            codename,
            external_id,
            terms: parsedTerms,
          })
          .toPromise();

        return createMcpToolSuccessResponse(response.data);
      } catch (error: any) {
        if (error instanceof SyntaxError) {
          return {
            content: [
              {
                type: "text" as const,
                text: `JSON parsing error: ${error.message}. Please ensure 'terms' is a valid JSON string representing the taxonomy hierarchy.`,
              },
            ],
            isError: true,
          };
        }
        return handleMcpToolError(error, "Taxonomy Group Creation");
      }
    },
  );
};
