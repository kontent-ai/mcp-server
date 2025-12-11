export const patchOperationsGuide = `
# Content Type & Snippet Patch Operations Guide

## Overview
Modify content types and snippets using RFC 6902 JSON Patch operations: move, addInto, remove, replace.

## Critical Requirements
- **Use addInto/remove for arrays** (elements, allowed_content_types, allowed_blocks, etc.)
- **Never use replace for array properties** - use addInto/remove instead
- **Use replace for primitives/objects** (name, maximum_text_length, validation_regex)
- **external_id and type cannot be modified** after creation
- **When adding allowed_formatting/allowed_table_formatting**, 'unstyled' must be first
- **Empty arrays enable all options** - For allowed_blocks, allowed_formatting, allowed_content_types, etc., an empty array means "allow all"

## Operations
- **move**: Reorganize elements/options/groups using 'before' or 'after' reference
- **addInto**: Add items to arrays (elements, options, allowed_blocks, etc.)
- **remove**: Delete items from arrays or remove elements/groups
- **replace**: Update primitives/objects (not external_id, id, or type)

## Path Formats
Use JSON Pointer with id:{uuid} format:
- Element: /elements/id:{uuid}
- Element property: /elements/id:{uuid}/name
- Option: /elements/id:{uuid}/options/id:{uuid}
- Content group: /content_groups/id:{uuid}
- Array item: /elements/id:{uuid}/allowed_content_types/id:{uuid}
`;
