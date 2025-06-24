import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";

export const registerTool = (server: McpServer): void => {
  server.tool(
    "upsert-language-variant-mapi",
    "Create or update a language variant of a content item via Management API. This adds actual content to the content item elements. Elements should be provided as JSON string in the format expected by the SDK.",
    {
      itemCodename: z.string().describe("Codename of the content item"),
      languageCodename: z
        .string()
        .describe(
          "Codename of the language variant (e.g., 'default', 'en-US', 'es-ES')",
        ),
      elements: z
        .string()
        .describe(
          'JSON string representing an array of element objects. Each element should have an "element" object with "codename" property and a "value" property. Example: \'[{"element": {"codename": "title"}, "value": "My Title"}, {"element": {"codename": "content"}, "value": "<p>My content</p>"}]\'',
        ),
      workflow_step_codename: z
        .string()
        .optional()
        .describe("Codename of the workflow step (optional)"),
    },
    async ({
      itemCodename,
      languageCodename,
      elements,
      workflow_step_codename,
    }) => {
      const client = createMapiClient();

      let parsedElements: any;
      try {
        parsedElements = JSON.parse(elements);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Invalid JSON format in elements parameter. ${error instanceof Error ? error.message : "Unknown JSON parsing error"}`,
            },
          ],
          isError: true,
        };
      }

      const data: any = {
        elements: parsedElements,
      };

      if (workflow_step_codename) {
        data.workflow_step = { codename: workflow_step_codename };
      }

      try {
        const response = await client
          .upsertLanguageVariant()
          .byItemCodename(itemCodename)
          .byLanguageCodename(languageCodename)
          .withData(() => data)
          .toPromise();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.rawData, null, 2),
            },
          ],
        };
      } catch (error: any) {
        // Handle Kontent.ai Management API specific errors
        if (
          error?.name === "ContentManagementBaseKontentError" ||
          error?.requestId
        ) {
          const errorMessage = [
            `Kontent.ai Management API Error:`,
            `Message: ${error.message || "Unknown API error"}`,
            error.errorCode ? `Error Code: ${error.errorCode}` : null,
            error.requestId ? `Request ID: ${error.requestId}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          // Include validation errors if available
          if (error.validationErrors && Array.isArray(error.validationErrors)) {
            const validationDetails = error.validationErrors
              .map((ve: any) => `- ${ve.message || JSON.stringify(ve)}`)
              .join("\n");

            return {
              content: [
                {
                  type: "text",
                  text: `${errorMessage}\n\nValidation Errors:\n${validationDetails}`,
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: errorMessage,
              },
            ],
            isError: true,
          };
        }

        // Handle network or other generic errors
        if (error?.response) {
          return {
            content: [
              {
                type: "text",
                text: `HTTP Error ${error.response.status}: ${error.response.statusText || "Unknown HTTP error"}\n\nResponse: ${JSON.stringify(error.response.data, null, 2)}`,
              },
            ],
            isError: true,
          };
        }

        // Handle generic errors
        return {
          content: [
            {
              type: "text",
              text: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error occurred"}\n\nFull error: ${JSON.stringify(error, null, 2)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
};
