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
{ "op": "replace", "property_name": "fallback_language", "value": { "codename": "en-US" } }
\`\`\`

Available properties: name, codename, fallback_language

## Critical Rule for Languages

**Only active languages can be modified.** To activate or deactivate a language, the user must use the Kontent.ai web UI - this is a critical operation that cannot be performed via API tools.

When user asks to update "all languages": only update active languages (is_active: true). If they need to modify inactive languages, inform them they must first activate those languages in the Kontent.ai web UI.

## General Rules
- external_id cannot be modified after creation
- Operations are applied in order
`;
