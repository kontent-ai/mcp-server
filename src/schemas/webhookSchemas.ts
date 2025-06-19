import { z } from "zod";

// Define a reusable reference object schema
const referenceObjectSchema = z.object({
  id: z.string().optional(),
  codename: z.string().optional(),
}).describe("An object with an id or codename property referencing another entity Using codename is preferred for better readability.");

// Webhook action types based on the official API documentation
const webhookContentTypeActionsSchema = z.enum(['created', 'changed', 'deleted'])
  .describe("Actions that can trigger the webhook for content types: created (when a content type is created - both slots), changed (when a content type is modified - both slots), deleted (when a content type is deleted - both slots)");

const webhookAssetActionsSchema = z.enum(['created', 'changed', 'metadata_changed', 'deleted'])
  .describe("Actions that can trigger the webhook for assets: created (when an asset is created - both slots), changed (when asset content is changed - both slots), metadata_changed (when asset metadata is changed - both slots), deleted (when an asset is deleted - both slots)");

const webhookTaxonomyActionsSchema = z.enum(['created', 'metadata_changed', 'deleted', 'term_created', 'term_changed', 'term_deleted', 'terms_moved'])
  .describe("Actions that can trigger the webhook for taxonomy groups: created (when a taxonomy group is created - both slots), metadata_changed (when taxonomy metadata is changed - both slots), deleted (when a taxonomy group is deleted - both slots), term_created (when a term is created - both slots), term_changed (when a term is changed - both slots), term_deleted (when a term is deleted - both slots), terms_moved (when terms are moved - both slots)");

const webhookLanguageActionsSchema = z.enum(['created', 'changed', 'deleted'])
  .describe("Actions that can trigger the webhook for languages: created (when a language is created - both slots), changed (when a language is modified - both slots), deleted (when a language is deleted - both slots)");

const webhookContentItemActionsSchema = z.enum(['published', 'unpublished', 'created', 'changed', 'metadata_changed', 'deleted', 'workflow_step_changed'])
  .describe("Actions that can trigger the webhook for content items: published (when item is published - published slot only), unpublished (when item is unpublished - published slot only), created (when item is created - preview slot only), changed (when item content is changed - preview slot only), metadata_changed (when item metadata is changed - preview slot only), deleted (when item is deleted - both slots), workflow_step_changed (when workflow step changes - preview slot only)");

// Webhook delivery trigger slots
const webhookDeliveryTriggerSlotsSchema = z.enum(['published', 'preview'])
  .describe("The API slot to monitor: published (monitors published content via Delivery API - cannot be combined with 'created', 'changed', 'metadata_changed', 'deleted', 'workflow_step_changed' content item actions), preview (monitors preview content via Preview API - can be combined with 'published', 'unpublished' content item actions). Other entity types (content types, assets, taxonomy, languages) support all actions in both slots.");

const webhookDeliveryTriggersEventsSchema = z.enum(['all', 'specific'])
  .describe("Event scope: all (triggers for all events in the slot), specific (triggers only for specifically configured events)");

// Filter schemas
const contentItemFiltersSchema = z.object({
  collections: z.array(referenceObjectSchema).optional()
    .describe("Filter by specific collections. Reference collections by their id or codename."),
  content_types: z.array(referenceObjectSchema).optional()
    .describe("Filter by specific content types. Reference content types by their id or codename."),
  languages: z.array(referenceObjectSchema).optional()
    .describe("Filter by specific languages. Reference languages by their id or codename."),
}).optional().describe("Filters to limit which content items trigger the webhook");

const contentTypeFiltersSchema = z.object({
  content_types: z.array(referenceObjectSchema).optional()
    .describe("Filter by specific content types. Reference content types by their id or codename."),
}).optional().describe("Filters to limit which content types trigger the webhook");

const taxonomyFiltersSchema = z.object({
  taxonomies: z.array(referenceObjectSchema).optional()
    .describe("Filter by specific taxonomy groups. Reference taxonomy groups by their id or codename."),
}).optional().describe("Filters to limit which taxonomy groups trigger the webhook");

const languageFiltersSchema = z.object({
  languages: z.array(referenceObjectSchema).optional()
    .describe("Filter by specific languages. Reference languages by their id or codename."),
}).optional().describe("Filters to limit which languages trigger the webhook");

// Workflow transition schema
const contentItemTransitionToSchema = z.object({
  workflow_identifier: referenceObjectSchema
    .describe("Reference to the target workflow by id or codename"),
  step_identifier: referenceObjectSchema
    .describe("Reference to the target workflow step by id or codename"),
}).describe("Defines a workflow step transition that should trigger the webhook");

// Action schemas with optional transition_to for content items
const webhookContentTypeActionSchema = z.object({
  action: webhookContentTypeActionsSchema,
}).describe("Content type action configuration");

const webhookAssetActionSchema = z.object({
  action: webhookAssetActionsSchema,
}).describe("Asset action configuration");

const webhookTaxonomyActionSchema = z.object({
  action: webhookTaxonomyActionsSchema,
}).describe("Taxonomy action configuration");

const webhookLanguageActionSchema = z.object({
  action: webhookLanguageActionsSchema,
}).describe("Language action configuration");

const webhookContentItemActionSchema = z.object({
  action: webhookContentItemActionsSchema,
  transition_to: z.array(contentItemTransitionToSchema).optional()
    .describe("Optional workflow transitions that should trigger this action. Only relevant for workflow_step_changed action."),
}).describe("Content item action configuration with optional workflow transitions");

// Webhook trigger configuration schemas
const webhookContentTypeTriggersSchema = z.object({
  enabled: z.boolean()
    .describe("Whether content type triggers are enabled for this webhook"),
  actions: z.array(webhookContentTypeActionSchema).optional()
    .describe("Specific actions that should trigger the webhook. If not specified, all actions will trigger."),
  filters: contentTypeFiltersSchema,
}).describe("Configuration for content type-related webhook triggers");

const webhookAssetTriggersSchema = z.object({
  enabled: z.boolean()
    .describe("Whether asset triggers are enabled for this webhook"),
  actions: z.array(webhookAssetActionSchema).optional()
    .describe("Specific actions that should trigger the webhook. If not specified, all actions will trigger."),
}).describe("Configuration for asset-related webhook triggers");

const webhookTaxonomyTriggersSchema = z.object({
  enabled: z.boolean()
    .describe("Whether taxonomy triggers are enabled for this webhook"),
  actions: z.array(webhookTaxonomyActionSchema).optional()
    .describe("Specific actions that should trigger the webhook. If not specified, all actions will trigger."),
  filters: taxonomyFiltersSchema,
}).describe("Configuration for taxonomy-related webhook triggers");

const webhookLanguageTriggersSchema = z.object({
  enabled: z.boolean()
    .describe("Whether language triggers are enabled for this webhook"),
  actions: z.array(webhookLanguageActionSchema).optional()
    .describe("Specific actions that should trigger the webhook. If not specified, all actions will trigger."),
  filters: languageFiltersSchema,
}).describe("Configuration for language-related webhook triggers");

const webhookContentItemTriggersSchema = z.object({
  enabled: z.boolean()
    .describe("Whether content item triggers are enabled for this webhook"),
  actions: z.array(webhookContentItemActionSchema).optional()
    .describe("Specific actions that should trigger the webhook. If not specified, all actions will trigger."),
  filters: contentItemFiltersSchema,
}).describe("Configuration for content item-related webhook triggers");

// Webhook header schema
const webhookHeaderSchema = z.object({
  key: z.string()
    .describe("The header name (e.g., 'Authorization', 'X-Custom-Header')"),
  value: z.string()
    .describe("The header value. For sensitive values like API keys, use secure storage practices."),
}).describe("Custom HTTP header to include in webhook requests");

// Main delivery triggers schema
const webhookDeliveryTriggersSchema = z.object({
  slot: webhookDeliveryTriggerSlotsSchema,
  events: webhookDeliveryTriggersEventsSchema,
  asset: webhookAssetTriggersSchema.optional()
    .describe("Asset-related trigger configuration. Only used when events is 'specific'."),
  content_type: webhookContentTypeTriggersSchema.optional()
    .describe("Content type-related trigger configuration. Only used when events is 'specific'."),
  taxonomy: webhookTaxonomyTriggersSchema.optional()
    .describe("Taxonomy-related trigger configuration. Only used when events is 'specific'."),
  language: webhookLanguageTriggersSchema.optional()
    .describe("Language-related trigger configuration. Only used when events is 'specific'."),
  content_item: webhookContentItemTriggersSchema.optional()
    .describe("Content item-related trigger configuration. Only used when events is 'specific'."),
}).describe("Configuration for delivery API triggers that determine when the webhook should fire");

// Main webhook schemas for CRUD operations
export const addWebhookSchema = z.object({
  name: z.string()
    .min(1, "Webhook name is required")
    .describe("Display name of the webhook. This will be shown in the Kontent.ai web interface."),
  url: z.string()
    .url("Must be a valid URL")
    .describe("The endpoint URL where webhook notifications will be sent. Must be a valid HTTPS URL in production."),
  secret: z.string()
    .min(1, "Secret is required")
    .describe("Secret key used to generate webhook signatures for request verification. Always use Cryptographically secure pseudorandom number generator to generate this secret. Store this securely and use it to verify incoming webhook requests."),
  enabled: z.boolean().optional().default(true)
    .describe("Whether the webhook is enabled. Disabled webhooks will not send notifications."),
  headers: z.array(webhookHeaderSchema).optional()
    .describe("Custom HTTP headers to include with webhook requests. Useful for authentication or custom processing instructions."),
  delivery_triggers: webhookDeliveryTriggersSchema,
}).describe("Data required to create a new webhook in Kontent.ai");

export const getWebhookParamsSchema = z.object({
  id: z.string()
    .describe("Webhook ID - the webhook's internal ID (e.g., '01234567-89ab-cdef-0123-456789abcdef')"),
}).describe("Parameters for retrieving a specific webhook"); 