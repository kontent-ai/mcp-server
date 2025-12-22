export const propertyBasedPatchGuide = `
# Patch Guide: Spaces & Languages

## Addressing
Use 'property_name' to specify which property to update. Only 'replace' operation is supported.

## Space Operations

**replace** - Update space properties
\`\`\`json
{ "op": "replace", "property_name": "name", "value": "New Space Name" }
{ "op": "replace", "property_name": "codename", "value": "new_codename" }
{ "op": "replace", "property_name": "collections", "value": [{ "id": "{uuid}" }, { "codename": "collection" }] }
\`\`\`

Available properties: name, codename, collections

## Language Operations

**replace** - Update language properties
\`\`\`json
{ "op": "replace", "property_name": "name", "value": "New Language Name" }
{ "op": "replace", "property_name": "codename", "value": "new_codename" }
{ "op": "replace", "property_name": "is_active", "value": true }
{ "op": "replace", "property_name": "fallback_language", "value": { "codename": "en-US" } }
\`\`\`

Available properties: name, codename, is_active, fallback_language

## Critical Rule for Languages
If a language is deactivated, you must activate it first before making other changes:
\`\`\`json
[
  { "op": "replace", "property_name": "is_active", "value": true },
  { "op": "replace", "property_name": "name", "value": "New Name" }
]
\`\`\`

## General Rules
- external_id cannot be modified after creation
- Operations are applied in order
`;
