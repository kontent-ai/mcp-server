import { z } from "zod";
import { createManagementClient } from '@kontent-ai/management-sdk';
import type { LanguageVariantContracts, LanguageVariantElements } from '@kontent-ai/management-sdk';
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const registerCreateItemVariantTool = (server: McpServer): void => {
  server.tool(
    "create-item-variant",
    "Create a content item variant in Kontent.ai",
    {
      itemCodename: z.string().describe("Codename of the content item"),
      languageCodename: z.string().describe("Codename of the language variant"),
      elements: z.record(z.string(), elementValueSchema).describe("Key-value pairs of element codenames and their values"),
      workflowStepId: z.string().optional().describe("Optional workflow step ID to set for the variant"),
    },
    async (args) => {
      try {
        const environmentId = process.env.KONTENT_ENVIRONMENT_ID;
        const managementApiKey = process.env.KONTENT_MANAGEMENT_API_KEY;

        if (!environmentId) {
          throw new Error("KONTENT_ENVIRONMENT_ID environment variable is not set");
        }

        if (!managementApiKey) {
          throw new Error("KONTENT_MANAGEMENT_API_KEY environment variable is not set");
        }

        const client = createManagementClient({
          environmentId,
          apiKey: managementApiKey
        });

        const elementArray = Object.entries(args.elements).map(([codename, elementData]) => {
          const element = { element: { codename }, value: elementData.value };

          if ('components' in elementData && elementData.components) {
            return { ...element, components: elementData.components };
          }
          if ('display_timezone' in elementData) {
            return { ...element, display_timezone: elementData.display_timezone };
          }
          if ('mode' in elementData) {
            return { ...element, mode: elementData.mode };
          }
          if ('searchable_value' in elementData && elementData.searchable_value) {
            return { ...element, searchable_value: elementData.searchable_value };
          }

          return element;
        });

        const variantData: LanguageVariantContracts.IUpsertLanguageVariantPostContract = {
          elements: elementArray,
          ...(args.workflowStepId && {
            workflow: {
              workflow_identifier: { codename: args.workflowStepId },
              step_identifier: { codename: args.workflowStepId }
            }
          })
        };

        const response = await client.upsertLanguageVariant()
          .byItemCodename(args.itemCodename)
          .byLanguageCodename(args.languageCodename)
          .withData(() => variantData)
          .toPromise();

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data)
          }]
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
          isError: true,
          content: [{
            type: "text" as const,
            text: `Error creating content item variant: ${errorMessage}`
          }]
        };
      }
    }
  );
};


// Define reference object contract schema
const referenceObjectSchema = z.union([
  z.object({
    codename: z.string()
  }),
  z.object({
    id: z.string()
  })
]);

// Individual element schemas
const textElementSchema: z.ZodType<Omit<LanguageVariantElements.ITextInVariantElement, 'element'>> = z.object({
  value: z.string().nullable()
}).strict();


const richTextElementSchema: z.ZodType<Omit<LanguageVariantElements.IRichtextInVariantElement, 'element'>> = z.object({
  value: z.string().nullable(),
  components: z.array(z.object({
    id: z.string(),
    type: referenceObjectSchema,
    elements: z.array(z.object({
      element: referenceObjectSchema,
      value: z.lazy(() => elementValueSchema)
    }))
  })).optional()
}).strict();

const numberElementSchema: z.ZodType<Omit<LanguageVariantElements.INumberInVariantElement, 'element'>> = z.object({
  value: z.number().nullable()
}).strict();

const multipleChoiceElementSchema: z.ZodType<Omit<LanguageVariantElements.IMultipleChoiceInVariantElement, 'element'>> = z.object({
  value: z.array(referenceObjectSchema).nullable()
}).strict();

const dateTimeElementSchema: z.ZodType<Omit<LanguageVariantElements.IDateTimeInVariantElement, 'element'>> = z.object({
  value: z.string().nullable(),
  display_timezone: z.string().nullable()
}).strict();

const assetElementSchema: z.ZodType<Omit<LanguageVariantElements.IAssetInVariantElement, 'element'>> = z.object({
  value: z.array(referenceObjectSchema).nullable()
}).strict();

const linkedItemsElementSchema: z.ZodType<Omit<LanguageVariantElements.ILinkedItemsInVariantElement, 'element'>> = z.object({
  value: z.array(referenceObjectSchema).nullable()
}).strict();

const urlSlugElementSchema: z.ZodType<Omit<LanguageVariantElements.IUrlSlugInVariantElement, 'element'>> = z.object({
  value: z.string().nullable(),
  mode: z.enum(['autogenerated', 'custom'])
}).strict();

const taxonomyElementSchema: z.ZodType<Omit<LanguageVariantElements.ITaxonomyInVariantElement, 'element'>> = z.object({
  value: z.array(referenceObjectSchema).nullable()
}).strict();

const customElementSchema: z.ZodType<Omit<LanguageVariantElements.ICustomElementInVariantElement, 'element'>> = z.object({
  value: z.string().nullable(),
  searchable_value: z.string().optional()
}).strict();

const elementValueSchema = z.lazy(() => z.union([
  textElementSchema,
  richTextElementSchema,
  numberElementSchema,
  multipleChoiceElementSchema,
  dateTimeElementSchema,
  assetElementSchema,
  linkedItemsElementSchema,
  urlSlugElementSchema,
  taxonomyElementSchema,
  customElementSchema
]));