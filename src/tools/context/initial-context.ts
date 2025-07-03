export const initialContext = `
# Kontent.ai Platform Guide

Kontent.ai is a headless content management system (CMS) that provides two main APIs: the Management API for creating, updating, and deleting content and structure, and the Delivery API for retrieving content for applications.

## Core Entities

### Content Items
Content items are language-neutral content containers that serve as the foundation for your content structure. Each content item has a unique identifier and codename, and references a specific content type. The key relationship to understand is that one content item can have multiple language variants.

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

Example: If a content type has direct elements (title, body) and a metadata snippet (meta_title, meta_description), your language variant must include ALL four elements.

**Failure to include snippet elements will result in incomplete content creation.**

## Working with Content Types Containing Taxonomy Groups

**CRITICAL**: When creating language variants for content types with taxonomy elements, you must:

1. **Read the content type** to identify ALL taxonomy elements (type: "taxonomy")
2. **Retrieve EACH taxonomy group definition** to understand the available terms and their hierarchical structure
3. **Fill ALL taxonomy elements** in the language variant - DO NOT leave any taxonomy elements empty
4. **Use appropriate term codenames** when filling taxonomy elements based on the content being created

**MANDATORY REQUIREMENT**: Every taxonomy element in the content type MUST be filled with at least one appropriate term when creating language variants. Empty taxonomy elements are not acceptable and indicate incomplete content creation.

**Example Process**: If a content type has three taxonomy elements:
- "article_type" (required) → Must select appropriate type like "patient_education"
- "topics" (optional but must be filled) → Must select relevant topics like "orthopedics", "surgery"
- "medical_specialties" (optional but must be filled) → Must select relevant specialties

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

## Essential Concepts

**Taxonomies** provide hierarchical content categorization, allowing you to organize and tag content systematically.

**Assets** are digital files including images, videos, and documents that can be referenced throughout your content.

**Workflow states** manage the content lifecycle, tracking whether content is being drafted, is live, or has been archived.

**Codenames** are human-readable unique identifiers that provide a consistent way to reference content programmatically.

## Best Practices

Use snippets for common field groups to maintain consistency and avoid duplication. Plan your content types before creating content to ensure proper structure. Use meaningful codenames consistently throughout your project for better maintainability. Leverage taxonomies for organization to create logical content hierarchies. Consider your multilingual strategy early in the planning process to avoid restructuring later.

When working with snippets, always retrieve and understand the complete element structure before creating content variants.

When working with taxonomy elements, always retrieve and understand the taxonomy group structure and available terms before creating content variants. **NEVER leave taxonomy elements empty - all taxonomy elements must be properly categorized.**`;
