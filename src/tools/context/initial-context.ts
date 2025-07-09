export const initialContext = `
# Kontent.ai Platform Guide

Kontent.ai is a headless content management system (CMS) that provides two main APIs: the Management API for creating, updating, and deleting content and structure, and the Delivery API for retrieving content for applications.

## Core Entities

### Content Items
Content items are language-neutral content containers that serve as the foundation for your content structure. Each content item has a unique internal ID and codename, and references a specific content type. The key relationship to understand is that one content item can have multiple language variants.

### Language Variants
Language variants contain the actual language-specific content data including field values, workflow state, and language reference. Importantly, each variant is managed independently per language.

### Content Types
Content types define the structure and blueprint for language variants. They specify field definitions, validation rules, and element types that language variants will use. Think of them as templates that determine what fields and data types your language variants will have.

### Content Type Snippets
Content type snippets are reusable field groups that promote consistency across multiple content types. Following the DRY principle (define once, use everywhere), one snippet can be used across multiple content types. This prevents duplication and ensures consistency when you need the same fields across different content types.

## Understanding Key Relationships

The content structure flows from Content Type → Content Item → Language Variant(s). For reusability, Content Type Snippets can be included in multiple Content Types. For localization, each Content Item can have one Language Variant per language.

## Working with Content Types Containing Snippets

**CRITICAL**: When creating language variants for content types with snippets, you must:

1. **Read the content type** to identify snippet elements (type: "snippet")
2. **Retrieve each snippet definition** to understand its internal elements
3. **Include ALL elements** from both the content type AND all snippets in the language variant

**SNIPPET ELEMENT IMPLEMENTATION DETAILS**:

When implementing snippet elements in language variants, follow these rules:
- **Element Reference Format**: Use {"element": {"id": "internal_id_here"}} format with internal IDs
- **Codename Convention**: Snippet elements use double underscore format: {snippet_codename}__{element_codename}
- **Example**: For a "metadata" snippet with a "title" element, the codename becomes metadata__title

**CRITICAL**: Always use internal IDs from snippet definitions, never construct codenames manually.

**Complete Example**:
Content type has: title, body (direct) + metadata snippet (meta_title, meta_description)
ALL FOUR elements must be included in language variant using their internal IDs:
- Direct element: title ("title_internal_id_here")
- Direct element: body ("body_internal_id_here")  
- Snippet element: metadata title ("metadata_title_internal_id_here")
- Snippet element: metadata description ("metadata_description_internal_id_here")

**Failure to include snippet elements or using incorrect references will result in incomplete content creation.**

## Working with Content Types Containing Taxonomy Groups

**CRITICAL**: When creating language variants for content types with taxonomy elements, you must:

1. **Read the content type** to identify ALL taxonomy elements (type: "taxonomy")
2. **Retrieve EACH taxonomy group definition** to understand the available terms and their hierarchical structure
3. **Fill ALL taxonomy elements** in the language variant - DO NOT leave any taxonomy elements empty
4. **Use appropriate term internal IDs** when filling taxonomy elements based on the content being created

**MANDATORY REQUIREMENT**: Every taxonomy element in the content type MUST be filled with at least one appropriate term when creating language variants. Empty taxonomy elements are not acceptable and indicate incomplete content creation.

**Example Process**: If a content type has three taxonomy elements:
- "article_type" (required) → Must select appropriate type using its internal ID
- "topics" (optional but must be filled) → Must select relevant topics using their internal IDs
- "medical_specialties" (optional but must be filled) → Must select relevant specialties using their internal IDs

**Failure to fill ALL taxonomy elements will result in incomplete content creation and poor content organization.**

## Operational Patterns

### Content Creation Workflow
1. Define content types (structure) - Create the blueprint for your content
2. Create content items (containers) - Establish the content containers
3. Add language variants (actual content) - Fill in the language-specific content
4. Publish variants (make live) - Make content available through the Delivery API

### Content Management Workflow
- Update language variants with new content or changes
- Manage workflow states as content progresses through its lifecycle
- Create new language variants when expanding to additional languages
- Organize with taxonomies for better content categorization

### Workflow Step Management

**CRITICAL**: When changing workflow steps of language variants, you must:

1. **Provide the workflowId parameter** - This is mandatory for all workflow step changes
2. **Use internal IDs** for itemId, languageId, and workflowStepId parameters
3. **Ensure the target workflow step exists** in the specified workflow

**WORKFLOW ID REQUIREMENT**: The workflowId parameter identifies which workflow contains the target step. Different content types may use different workflows, so always specify the correct workflow ID when changing workflow steps.

**Example**: To move a language variant to a "review" step:
- itemId: "content_item_internal_id"
- languageId: "language_internal_id" 
- workflowStepId: "review_step_internal_id"
- workflowId: "workflow_internal_id" (MANDATORY)

**Failure to provide the workflowId parameter will result in workflow step change failures.**

## Essential Concepts

**Taxonomies** provide hierarchical content categorization, allowing you to organize and tag content systematically.

**Assets** are digital files including images, videos, and documents that can be referenced throughout your content.

**Workflow states** manage the content lifecycle, tracking whether content is being drafted, is live, or has been archived.

**Internal IDs** are unique identifiers that provide fast and reliable access to content entities. **ALWAYS use internal IDs when working with MCP tools for better performance and reliability.**

**Codenames** are human-readable unique identifiers that provide a consistent way to reference content programmatically, but should be used primarily for readability and debugging.

## Best Practices

Use snippets for common field groups to maintain consistency and avoid duplication. Plan your content types before creating content to ensure proper structure. **Always use internal IDs when working with MCP tools** for optimal performance and reliability. Leverage taxonomies for organization to create logical content hierarchies. Consider your multilingual strategy early in the planning process to avoid restructuring later.

When working with snippets, always retrieve and understand the complete element structure before creating content variants.

When working with taxonomy elements, always retrieve and understand the taxonomy group structure and available terms before creating content variants. **NEVER leave taxonomy elements empty - all taxonomy elements must be properly categorized using internal IDs.**

## MCP Tool Usage Guidelines

**CRITICAL**: When using MCP tools, always prefer internal IDs over codenames:

- **Content Items**: Use internal IDs to reference content items
- **Language Variants**: Use internal IDs for both item and language references
- **Content Types**: Use internal IDs to reference content types
- **Taxonomy Terms**: Use internal IDs when referencing taxonomy terms
- **Assets**: Use internal IDs when referencing assets
- **Workflow Steps**: Use internal IDs for workflow step references

**Why Internal IDs?** Internal IDs provide:
- Better performance (faster lookups)
- Immutability (won't change if names change)
- Reliability (consistent across environments)
- API efficiency (direct database lookups)

**When to use codenames?** Codenames are useful for:
- Human readability during development
- Debugging and logging
- Initial content setup when IDs are not yet known

All MCP tools have been optimized to work with internal IDs for maximum efficiency.`;
