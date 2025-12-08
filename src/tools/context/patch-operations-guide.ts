export const patchOperationsGuide = `
# Content Type & Snippet Patch Operations Guide

## Overview
Modify content types and snippets using RFC 6902 JSON Patch operations: move, addInto, remove, replace.

## Critical Requirements
- **Always call get-type-mapi or get-type-snippet-mapi first** to get current schema
- **Use addInto/remove for arrays** (elements, allowed_content_types, allowed_blocks, etc.)
- **Never use replace for array properties** - use addInto/remove instead
- **Use replace for primitives/objects** (name, maximum_text_length, validation_regex)
- **external_id and type cannot be modified** after creation
- **When adding allowed_formatting/allowed_table_formatting**, 'unstyled' must be first
- **Empty arrays enable all options** - For allowed_blocks, allowed_formatting, allowed_content_types, etc., an empty array means "allow all"
- **Snippets cannot contain**: content_groups, subpages, snippet, or url_slug elements

## Operation Types

### move
Reorganize elements, options, or content groups (content types only) using 'before' or 'after' reference.

### addInto
Add new items to arrays. Use for all array operations (elements, options, allowed_blocks, etc.).

### remove
Delete items from arrays or remove elements/groups.

### replace
Update primitives and objects. Cannot modify external_id, id, or type.

## Path Formats
Use JSON Pointer with id:{uuid} format:
- Element: /elements/id:{uuid}
- Element property: /elements/id:{uuid}/name
- Option: /elements/id:{uuid}/options/id:{uuid}
- Content group: /content_groups/id:{uuid} (content types only)
- Array item: /elements/id:{uuid}/allowed_content_types/id:{uuid}

## Rich Text Properties
- **allowed_content_types**: Content types for components/linked items (empty=all)
- **allowed_item_link_types**: Content types for text links (empty=all)
- **allowed_blocks**: "images", "text", "tables", "components-and-items" (empty=all)
- **allowed_image_types**: "adjustable" or "any"
- **allowed_text_blocks**: "paragraph", "heading-one" through "heading-six", "ordered-list", "unordered-list" (empty=all)
- **allowed_formatting**: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript" (empty=all, unstyled must be first)
- **allowed_table_blocks**: "images", "text" (empty=both)
- **allowed_table_text_blocks**: Same as allowed_text_blocks (empty=all)
- **allowed_table_formatting**: Same as allowed_formatting (empty=all, unstyled must be first)

## Special Techniques
- **Remove content groups** (content types only): Set ALL elements' content_group to null AND remove ALL groups in one request
- **URL Slug with snippet** (content types only): Add snippet element first, then URL slug with depends_on reference

## Best Practices
- Use descriptive codenames
- Group related operations in single request
- Use id:{uuid} format in paths
- Validate dependencies before adding URL slugs
- Consider element ordering for move operations
`;
