import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

// Context seems to be better understandable to GPT 4.1 than the very complex schema
export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-patch-operations-context-mapi",
    "Get comprehensive context and examples for content type patch operations. This tool provides educational information about how to use move, addInto, remove, and replace operations following RFC 6902 JSON Patch specification.",
    {},
    async () => {
      const patchOperationsContext = {
        overview: {
          description:
            "Content type patch operations allow you to modify existing content types using JSON Patch specification (RFC 6902)",
          supportedOperations: ["move", "addInto", "remove", "replace"],
          criticalRules: [
            "ALWAYS call get-type-mapi tool before patching to get the latest content type schema",
            `Use addInto/remove for array operations (adding/removing items from arrays like elements 
            and element's array properties - allowed_content_types, allowed_item_link_types, allowed_blocks, allowed_text_blocks, allowed_formatting, allowed_table_blocks, allowed_table_text_blocks, allowed_table_formatting, allowed_formatting, allowed_table_blocks, allowed_table_text_blocks, allowed_table_formatting)`,
            "Never ever use replace for array properties - use addInto/remove instead",
            "Use replace for primitive data types and object properties (maximum_text_length, ...)",
            "External_id and type cannot be modified after creation",
            "Patch operations with URL Slug elements referencing snippet elements MUST ensure snippet is present first",
            "When adding to allowed_formatting or allowed_table_formatting, 'unstyled' must be the first item in the array. If it is not present, then add it as first operation.",
            `RICH TEXT ELEMENT PROPERTIES:
    allowed_content_types: Array of content type references. Specifies allowed content types for components and linked items. Empty array allows all.
    allowed_item_link_types: Array of content type references. Specifies content types allowed in text links (applies to text and tables). Empty array allows all.
    allowed_blocks: Available options: "images", "text", "tables", "components-and-items". Empty array allows all blocks.
    allowed_image_types: Available options: "adjustable" (only transformable images), "any" (all image files).
    allowed_text_blocks: Available options: "paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list". Empty array allows all.
    allowed_formatting: Available options: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript". "unstyled" must be first if used. Empty array allows all.
    allowed_table_blocks: Available options: "images", "text". Use ["text"] for text-only or empty array for both text and images.
    allowed_table_text_blocks: Available options: "paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list". Empty array allows all.
    allowed_table_formatting: Available options: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript". "unstyled" must be first if used. Empty array allows all.
`,
          ],
        },
        operations: {
          move: {
            description:
              "Reorganize elements, options, or content groups within the content type",
            syntax: {
              op: "move",
              path: "JSON Pointer to object being moved (format: id:{uuid})",
              before:
                "Reference to object before which to move (optional, mutually exclusive with after)",
              after:
                "Reference to object after which to move (optional, mutually exclusive with before)",
            },
            examples: [
              {
                description: "Move an element before another element",
                operation: {
                  op: "move",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000",
                  before: { id: "target_element_id" },
                },
              },
              {
                description: "Move a multiple choice option",
                operation: {
                  op: "move",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:987fcdeb-51a2-43d1-9f4e-123456789abc",
                  after: { codename: "another_option" },
                },
              },
              {
                description: "Move a content group",
                operation: {
                  op: "move",
                  path: "/content_groups/id:456e7890-a12b-34c5-d678-901234567def",
                  before: { codename: "another_group" },
                },
              },
            ],
          },
          addInto: {
            description:
              "Add new elements, options, content groups, or array items to the content type",
            syntax: {
              op: "addInto",
              path: "JSON Pointer path where to add the item (format: id:{uuid})",
              value: "The item to add (element, content group, option, etc.)",
            },
            examples: [
              {
                description: "Add a new text element",
                operation: {
                  op: "addInto",
                  path: "/elements",
                  value: {
                    type: "text",
                    name: "New Text Field",
                    codename: "new_text_field",
                    is_required: false,
                  },
                },
              },
              {
                description: "Add a content group",
                operation: {
                  op: "addInto",
                  path: "/content_groups",
                  value: {
                    name: "New Content Group",
                    codename: "new_content_group",
                  },
                },
              },
              {
                description: "Add multiple choice option",
                operation: {
                  op: "addInto",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/options",
                  value: {
                    name: "New Option",
                    codename: "new_option",
                  },
                },
              },
              {
                description: "Add allowed content type to rich text element",
                operation: {
                  op: "addInto",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types",
                  value: { codename: "article" },
                },
              },
              {
                description:
                  "Add rich text formatting option (ensure 'unstyled' is first in the array)",
                operation: {
                  op: "addInto",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_formatting",
                  value: "bold",
                },
              },
            ],
          },
          remove: {
            description:
              "Remove elements, options, content groups, or array items from the content type",
            syntax: {
              op: "remove",
              path: "JSON Pointer path to the item being removed (format: id:{uuid})",
            },
            examples: [
              {
                description: "Remove an element",
                operation: {
                  op: "remove",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000",
                },
              },
              {
                description: "Remove a multiple choice option",
                operation: {
                  op: "remove",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:321dcba9-87f6-54e3-21b0-fedcba987654",
                },
              },
              {
                description:
                  "Remove content group (removes all elements within the group)",
                operation: {
                  op: "remove",
                  path: "/content_groups/id:456e7890-a12b-34c5-d678-901234567def",
                },
              },
              {
                description:
                  "Remove allowed content type from rich text element",
                operation: {
                  op: "remove",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types/id:987fcdeb-51a2-43d1-9f4e-123456789abc",
                },
              },
              {
                description: "Remove rich text block limitation",
                operation: {
                  op: "remove",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_blocks/images",
                },
              },
            ],
          },
          replace: {
            description:
              "Replace/update existing properties in the content type. Cannot modify external_id, id, or type of elements.",
            syntax: {
              op: "replace",
              path: "JSON Pointer path to the property being replaced (format: id:{uuid})",
              value: "The new value to replace the existing one",
            },
            canModify: [
              "Content type name and codename",
              "Element properties (name, guidelines, validation, etc.) based on element type",
              "Content group properties",
              "Multiple choice option properties (name, codename)",
            ],
            cannotModify: [
              "external_id of elements",
              "id of elements",
              "type of elements",
              "Individual items in arrays (use addInto/remove instead)",
            ],
            examples: [
              {
                description: "Change content type name",
                operation: {
                  op: "replace",
                  path: "/name",
                  value: "Updated Content Type Name",
                },
              },
              {
                description: "Change element name",
                operation: {
                  op: "replace",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/name",
                  value: "Updated Element Name",
                },
              },
              {
                description: "Change element guidelines",
                operation: {
                  op: "replace",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/guidelines",
                  value: "Updated guidelines for this element",
                },
              },
              {
                description: "Change content group name",
                operation: {
                  op: "replace",
                  path: "/content_groups/id:456e7890-a12b-34c5-d678-901234567def/name",
                  value: "Updated Content Group Name",
                },
              },
              {
                description: "Update element validation regex",
                operation: {
                  op: "replace",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/validation_regex",
                  value: {
                    is_active: true,
                    regex: "^[A-Z][a-z]+$",
                    validation_message: "Must start with uppercase letter",
                  },
                },
              },
              {
                description: "Change multiple choice option name",
                operation: {
                  op: "replace",
                  path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:321dcba9-87f6-54e3-21b0-fedcba987654/name",
                  value: "Updated Option Name",
                },
              },
            ],
          },
        },
        specialTechniques: {
          removeContentGroupsKeepElements: {
            description:
              "Remove ALL content groups and move elements to the top level of the content type (without content groups)",
            technique:
              "Atomic approach - all operations MUST be in the SAME request to bypass validation",
            steps: [
              "1. Set ALL elements' content_group to null using replace operations",
              "2. Remove ALL content groups using remove operations",
              "3. CRITICAL: All operations MUST be in the SAME request",
            ],
            example: [
              {
                op: "replace",
                path: "/elements/id:123e4567-e89b-12d3-a456-426614174000/content_group",
                value: null,
              },
              {
                op: "replace",
                path: "/elements/id:987fcdeb-51a2-43d1-9f4e-123456789abc/content_group",
                value: null,
              },
              {
                op: "remove",
                path: "/content_groups/id:456e7890-a12b-34c5-d678-901234567def",
              },
              {
                op: "remove",
                path: "/content_groups/id:321dcba9-87f6-54e3-21b0-fedcba987654",
              },
            ],
          },
          urlSlugWithSnippetDependency: {
            description:
              "When adding a URL slug that references a snippet element",
            requirement:
              "CRITICAL: First add the snippet element to the content type if it's not already included",
            steps: [
              "1. Check if snippet element exists in content type",
              "2. If not present, add snippet element first using addInto operation",
              "3. Then add URL slug element with depends_on reference to snippet",
            ],
            example: [
              {
                op: "addInto",
                path: "/elements",
                value: {
                  type: "snippet",
                  snippet: { codename: "metadata_snippet" },
                },
              },
              {
                op: "addInto",
                path: "/elements",
                value: {
                  type: "url_slug",
                  name: "URL Slug",
                  codename: "url_slug",
                  depends_on: {
                    element: { codename: "metadata_snippet" },
                  },
                },
              },
            ],
          },
        },
        pathFormats: {
          description:
            "JSON Pointer paths must use id:{uuid} format for referencing objects",
          examples: {
            element: "/elements/id:123e4567-e89b-12d3-a456-426614174000",
            elementProperty:
              "/elements/id:123e4567-e89b-12d3-a456-426614174000/name",
            multipleChoiceOption:
              "/elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:987fcdeb-51a2-43d1-9f4e-123456789abc",
            contentGroup:
              "/content_groups/id:456e7890-a12b-34c5-d678-901234567def",
            allowedContentType:
              "/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types/id:987fcdeb-51a2-43d1-9f4e-123456789abc",
            richTextBlock:
              "/elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_blocks/images",
          },
          note: "For allowed_formatting, allowed_table_formatting, and other rich text limitations, an empty array means all options are allowed.",
        },
        bestPractices: [
          "Always fetch the current content type schema with get-type-mapi before patching",
          "Use descriptive codenames following naming conventions",
          "Group related operations in a single patch request when possible",
          "Use proper reference formats (id:{uuid}) in paths",
          "Validate element dependencies before adding URL slug elements",
          "Consider element ordering when using move operations",
          "Use atomic operations for complex changes like removing content groups",
          "When adding to allowed_formatting or allowed_table_formatting, always ensure 'unstyled' is the first item in the array",
        ],
        commonUseCases: [
          {
            useCase: "Add new element to content type",
            operations: ["addInto to /elements"],
          },
          {
            useCase: "Rename an element",
            operations: ["replace element name property"],
          },
          {
            useCase: "Reorder elements",
            operations: ["move elements with before/after references"],
          },
          {
            useCase: "Add options to multiple choice element",
            operations: ["addInto to element options array"],
          },
          {
            useCase: "Remove content groups but keep elements",
            operations: [
              "replace all element content_group to null",
              "remove all content groups",
            ],
          },
          {
            useCase: "Update element validation",
            operations: ["replace validation_regex property"],
          },
          {
            useCase: "Add allowed content types to rich text",
            operations: ["addInto to allowed_content_types array"],
          },
        ],
      };

      return createMcpToolSuccessResponse({
        message: "Content type patch operations context retrieved successfully",
        context: patchOperationsContext,
      });
    },
  );
};
