import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMapiClient } from "../clients/kontentClients.js";
import type { AppConfiguration } from "../config/appConfiguration.js";
import { patchOperationsSchema } from "../schemas/patchSchemas/contentTypePatchSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";

export const registerTool = (
  server: McpServer,
  config: AppConfiguration | null,
): void => {
  server.tool(
    "patch-content-type-mapi",
    "Update an existing Kontent.ai content type by codename via Management API. Supports move, addInto, remove, and replace operations following RFC 6902 JSON Patch specification.",
    {
      codename: z.string().describe("Codename of the content type to update"),
      operations: patchOperationsSchema.describe(
        `Array of patch operations to apply. Supports: 'move' (reorganize elements), 'addInto' (add new elements), 'remove' (delete elements), 'replace' (update existing elements/properties).
        
        CRITICAL REQUIREMENTS:
        - ALWAYS call get-type-mapi tool before patching to get the latest content type schema
        - Use addInto/remove for array operations (adding/removing items from arrays like elements and element's array properties - allowed_content_types, allowed_item_link_types, allowed_blocks, allowed_text_blocks, allowed_formatting, allowed_table_blocks, allowed_table_text_blocks, allowed_table_formatting)
        - Never ever use replace for element's array properties - use addInto/remove instead
        - Use replace for element's primitive data types and object properties (maximum_text_length, validation_regex, etc.)
        - External_id and type cannot be modified after creation
        - Patch operations with URL Slug elements referencing snippet elements MUST ensure snippet is present first
        - When adding to allowed_formatting or allowed_table_formatting, 'unstyled' must be the first item in the array. If it is not present, then add it as first operation.
        
        RICH TEXT ELEMENT PROPERTIES:
        - allowed_content_types: Array of content type references. Specifies allowed content types for components and linked items. Empty array allows all.
        - allowed_item_link_types: Array of content type references. Specifies content types allowed in text links (applies to text and tables). Empty array allows all.
        - allowed_blocks: Available options: "images", "text", "tables", "components-and-items". Empty array allows all blocks.
        - allowed_image_types: Available options: "adjustable" (only transformable images), "any" (all image files).
        - allowed_text_blocks: Available options: "paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list". Empty array allows all.
        - allowed_formatting: Available options: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript". "unstyled" must be first if used. Empty array allows all.
        - allowed_table_blocks: Available options: "images", "text". Use ["text"] for text-only or empty array for both text and images.
        - allowed_table_text_blocks: Available options: "paragraph", "heading-one", "heading-two", "heading-three", "heading-four", "heading-five", "heading-six", "ordered-list", "unordered-list". Empty array allows all.
        - allowed_table_formatting: Available options: "unstyled", "bold", "italic", "code", "link", "subscript", "superscript". "unstyled" must be first if used. Empty array allows all.
        
        OPERATION TYPES:
        1. move: Reorganize elements, options, or content groups. Uses 'before' or 'after' reference.
        2. addInto: Add new elements, options, content groups, or array items. Use for all array operations.
        3. remove: Remove elements, options, content groups, or array items. Use for all array removals.
        4. replace: Update existing properties of primitive data types and objects. Cannot modify external_id, id, or type.
        
        PATH FORMATS:
        - Use JSON Pointer paths with id:{uuid} format for referencing objects
        - Element: /elements/id:123e4567-e89b-12d3-a456-426614174000
        - Element property: /elements/id:123e4567-e89b-12d3-a456-426614174000/name
        - Multiple choice option: /elements/id:123e4567-e89b-12d3-a456-426614174000/options/id:987fcdeb-51a2-43d1-9f4e-123456789abc
        - Content group: /content_groups/id:456e7890-a12b-34c5-d678-901234567def
        - Rich text array property: /elements/id:123e4567-e89b-12d3-a456-426614174000/allowed_content_types/id:987fcdeb-51a2-43d1-9f4e-123456789abc
        
        SPECIAL TECHNIQUES:
        - To remove content groups while keeping elements: Set ALL elements' content_group to null AND remove ALL content groups in ONE request (atomic operation)
        - URL Slug with snippet dependency: First add snippet element, then add URL slug with depends_on reference
        
        BEST PRACTICES:
        - Use descriptive codenames following naming conventions
        - Group related operations in a single patch request when possible
        - Use proper reference formats (id:{uuid}) in paths
        - Validate element dependencies before adding URL slug elements
        - Consider element ordering when using move operations
        - Use atomic operations for complex changes like removing content groups
        - When adding to allowed_formatting or allowed_table_formatting, always ensure 'unstyled' is the first item in the array`,
      ),
    },
    async (
      { codename, operations },
      { authInfo: { token, clientId } = {} },
    ) => {
      const client = createMapiClient(clientId, token, config);

      try {
        // Apply patch operations using the modifyContentType method
        const response = await client
          .modifyContentType()
          .byTypeCodename(codename)
          .withData(operations)
          .toPromise();

        return createMcpToolSuccessResponse({
          message: `Content type '${codename}' updated successfully with ${operations.length} operation(s)`,
          contentType: response.rawData,
          appliedOperations: operations,
        });
      } catch (error: unknown) {
        return handleMcpToolError(error, `Content Type Patch`);
      }
    },
  );
};
