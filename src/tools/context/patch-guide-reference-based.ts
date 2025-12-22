export const referenceBasedPatchGuide = `
# Patch Guide: Taxonomy, Collections & Asset Folders

## Addressing
Use 'reference' objects: { id: "{uuid}" } or { codename: "codename" }

## Taxonomy Group Operations

**addInto** - Add terms
\`\`\`json
{ "op": "addInto", "value": { "name": "Term" } }
{ "op": "addInto", "reference": { "id": "{parent-uuid}" }, "value": { "name": "Child Term" } }
{ "op": "addInto", "value": { "name": "Term" }, "before": { "id": "{uuid}" } }
{ "op": "addInto", "value": { "name": "Term" }, "after": { "id": "{uuid}" } }
\`\`\`

**move** - Reorder or nest terms (before/after/under are mutually exclusive)
\`\`\`json
{ "op": "move", "reference": { "id": "{uuid}" }, "before": { "id": "{uuid}" } }
{ "op": "move", "reference": { "id": "{uuid}" }, "after": { "id": "{uuid}" } }
{ "op": "move", "reference": { "id": "{uuid}" }, "under": { "id": "{parent-uuid}" } }
\`\`\`

**remove** - Delete terms
\`\`\`json
{ "op": "remove", "reference": { "id": "{uuid}" } }
\`\`\`

**replace** - Update properties
\`\`\`json
{ "op": "replace", "property_name": "name", "value": "New Group Name" }
{ "op": "replace", "reference": { "id": "{uuid}" }, "property_name": "name", "value": "New Term Name" }
{ "op": "replace", "reference": { "id": "{uuid}" }, "property_name": "terms", "value": [] }
\`\`\`

## Collection Operations

**addInto** - Add collections
\`\`\`json
{ "op": "addInto", "value": { "name": "Collection", "codename": "collection" } }
{ "op": "addInto", "value": { "name": "Collection" }, "before": { "id": "{uuid}" } }
{ "op": "addInto", "value": { "name": "Collection" }, "after": { "id": "{uuid}" } }
\`\`\`

**move** - Reorder collections
\`\`\`json
{ "op": "move", "reference": { "id": "{uuid}" }, "before": { "id": "{uuid}" } }
{ "op": "move", "reference": { "id": "{uuid}" }, "after": { "id": "{uuid}" } }
\`\`\`

**remove** - Delete empty collections only
\`\`\`json
{ "op": "remove", "reference": { "id": "{uuid}" } }
\`\`\`

**replace** - Rename collections
\`\`\`json
{ "op": "replace", "reference": { "id": "{uuid}" }, "property_name": "name", "value": "New Name" }
\`\`\`

## Asset Folder Operations

**addInto** - Add folders
\`\`\`json
{ "op": "addInto", "value": { "name": "Folder" } }
{ "op": "addInto", "reference": { "id": "{parent-uuid}" }, "value": { "name": "Subfolder" } }
{ "op": "addInto", "value": { "name": "Folder" }, "before": { "id": "{uuid}" } }
\`\`\`

**rename** - Rename folders (not 'replace')
\`\`\`json
{ "op": "rename", "reference": { "id": "{uuid}" }, "value": "New Folder Name" }
\`\`\`

**remove** - Delete folders
\`\`\`json
{ "op": "remove", "reference": { "id": "{uuid}" } }
\`\`\`

Note: Asset folders do not support 'move' operation.

## General Rules
- Always fetch the entity first to get current IDs
- external_id cannot be modified after creation
- Operations are applied in order
`;
