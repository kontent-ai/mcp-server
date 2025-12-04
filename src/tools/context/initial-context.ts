export const initialContext = `
# Kontent.ai Platform Guide

Kontent.ai provides the Management API for creating, updating, and deleting content and structure.

## Core Concepts

### Content Items
Content items are language-neutral content containers that serve as the foundation for your content structure. The key relationship to understand is that one content item can have multiple language variants.

### Language Variants
Language variants contain the actual language-specific content data including field values, workflow state, and language reference. Importantly, each variant is managed independently per language. Language variant fields have structure defined by content type referenced in content item. Content type contains elements defined in it and elements from referenced content type snippets. Variant element values should fulfill the limitations and guidelines defined in the content type elements.

### Content Types
Content types define the structure for language variants, specifying field definitions, validation rules, and element types.

### Content Type Snippets
Content type snippet defines a set of elements that can be used in a content type via snippet element.

### Collections
Collections organize content items into logical groups by team, brand, or project. Each content item belongs to exactly one collection.

### Languages
Languages define available locales for content. Each language can have a fallback language for content inheritance and can be activated or deactivated.

### Taxonomies
Taxonomies provide hierarchical content categorization, allowing you to organize and tag content systematically.

### Assets
Assets are digital files including images, videos, and documents that can be referenced throughout your content.

### Workflow States
Workflow states manage the content lifecycle, tracking whether content is being drafted, is live, or has been archived.

## Response Format

Omitted properties indicate default values. Omitted limitations in content types mean no restrictions.

## Important Notes

Never assume the current time. Always obtain the current date and time when needed for time-sensitive operations like scheduling. If the current date and time cannot be decisively obtained, ask the user to specify it.`;