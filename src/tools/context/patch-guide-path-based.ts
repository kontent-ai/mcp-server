export const pathBasedPatchGuide = `
# Patch Guide: Content Types & Snippets

## Addressing
Use JSON Pointer 'path' property with id:{uuid} format.

## Path Formats
- Element: /elements/id:{uuid}
- Element property: /elements/id:{uuid}/name
- Option: /elements/id:{uuid}/options/id:{uuid}
- Content group: /content_groups/id:{uuid}
- Array item: /elements/id:{uuid}/allowed_content_types/id:{uuid}

## Operations

**move** - Reorder elements/options/groups
\`\`\`json
{ "op": "move", "path": "/elements/id:{uuid}", "before": { "id": "{uuid}" } }
{ "op": "move", "path": "/elements/id:{uuid}", "after": { "id": "{uuid}" } }
\`\`\`

**addInto** - Add to arrays (elements, options, allowed_blocks, etc.)
\`\`\`json
{ "op": "addInto", "path": "/elements", "value": { "name": "Title", "type": "text", ... } }
{ "op": "addInto", "path": "/elements/id:{uuid}/allowed_content_types", "value": { "id": "{uuid}" } }
\`\`\`

**remove** - Delete items
\`\`\`json
{ "op": "remove", "path": "/elements/id:{uuid}" }
{ "op": "remove", "path": "/elements/id:{uuid}/allowed_content_types/id:{uuid}" }
\`\`\`

**replace** - Update primitives/objects
\`\`\`json
{ "op": "replace", "path": "/elements/id:{uuid}/name", "value": "New Name" }
{ "op": "replace", "path": "/elements/id:{uuid}/maximum_text_length", "value": { "value": 100, "applies_to": "characters" } }
\`\`\`

## Rules
- Use addInto/remove for arrays, replace for primitives/objects
- external_id and type cannot be modified after creation
- Empty arrays enable all options (allowed_blocks, allowed_formatting, etc.)
- 'unstyled' must be first when adding allowed_formatting

## Content Type Specifics
- Only one url_slug element allowed per content type
- To remove content groups: set ALL elements' content_group to null AND remove ALL groups in one request
- URL slug with snippet: add snippet element first, then url_slug with depends_on reference

## Snippet Specifics
- Cannot contain: content_groups, snippet, or url_slug elements
`;
