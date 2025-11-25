/**
 * Utility for creating standardized MCP tool success responses
 */

export interface McpToolSuccessResponse {
  [x: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: false;
}

/**
 * Checks if a value is considered "empty" or default
 *
 * Empty/default values that should be removed:
 * - null and undefined
 * - empty strings ("")
 * - empty arrays ([])
 * - empty objects ({})
 * - rich text empty paragraphs ("<p><br/></p>")
 *
 * @param value The value to check
 * @returns true if the value is empty/default, false otherwise
 */
export function isEmptyOrDefault(value: any): boolean {
  // null or undefined
  if (value === null || value === undefined) {
    return true;
  }

  // Empty string
  if (typeof value === "string" && value === "") {
    return true;
  }

  // Rich text empty paragraph (common default in Kontent.ai)
  if (typeof value === "string" && value === "<p><br/></p>") {
    return true;
  }

  // Empty array
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  // Empty object (but not dates, functions, or other special objects)
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Function) &&
    Object.keys(value).length === 0
  ) {
    return true;
  }

  return false;
}

/**
 * Removes elements that only contain an 'element' property from variant responses
 * This is the second phase of optimization specifically for variant responses
 *
 * @param obj The object to process (should be already cleaned of empty values)
 * @returns The object with empty elements removed from all 'elements' arrays
 */
export function removeEmptyElementsFromVariant(obj: any): any {
  // Handle non-objects
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => removeEmptyElementsFromVariant(item));
  }

  // Handle objects
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Special handling for 'elements' arrays
    if (key === "elements" && Array.isArray(value)) {
      // Filter out elements that only have the 'element' property
      const filteredElements = value
        .filter((element) => {
          if (typeof element !== "object" || element === null) {
            return true; // Keep non-objects
          }
          const keys = Object.keys(element);
          // Keep element if it has more than just the 'element' property
          return !(keys.length === 1 && keys[0] === "element");
        })
        .map((element) => {
          // Process each filtered element to handle nested structures
          return removeEmptyElementsFromVariant(element);
        });

      // Only include the elements array if it's not empty after filtering
      if (filteredElements.length > 0) {
        result[key] = filteredElements;
      }
    } else {
      // Recursively process other properties
      const processedValue = removeEmptyElementsFromVariant(value);
      if (processedValue !== undefined) {
        result[key] = processedValue;
      }
    }
  }

  return result;
}

/**
 * Removes all empty/default values from an object or array recursively
 *
 * This function optimizes response size by:
 * - Recursively removing null, undefined, empty strings, empty arrays, empty objects at all levels
 * - Removing rich text empty paragraphs ("<p><br/></p>")
 * - Processing all nested structures deeply
 *
 * @param obj The object or array to process
 * @returns The processed object with empty values removed
 */
export function removeEmptyValues(obj: any): any {
  // Handle primitives and null/undefined
  if (obj === null || obj === undefined) {
    return undefined;
  }

  // Handle primitive values
  if (typeof obj !== "object") {
    return isEmptyOrDefault(obj) ? undefined : obj;
  }

  // Handle arrays - recursively process each item
  if (Array.isArray(obj)) {
    const cleaned = obj
      .map((item) => removeEmptyValues(item)) // Recursively clean each item
      .filter((item) => item !== undefined);

    return cleaned.length === 0 ? undefined : cleaned;
  }

  // Handle objects - recursively process all properties
  const cleaned: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Recursively clean the value
    const cleanedValue = removeEmptyValues(value);

    // Only keep non-undefined values
    if (cleanedValue !== undefined) {
      cleaned[key] = cleanedValue;
    }
  }

  // Return undefined if object becomes empty after cleaning
  const keys = Object.keys(cleaned);
  return keys.length === 0 ? undefined : cleaned;
}

/**
 * Creates a standardized MCP tool success response
 * @param data The data to include in the response
 * @returns Standardized MCP tool success response
 */
export const createMcpToolSuccessResponse = (
  data: any,
): McpToolSuccessResponse => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(removeEmptyValues(data)),
      },
    ],
  };
};

/**
 * Creates a standardized MCP tool success response specifically for variant responses
 * Applies additional optimization by removing elements with only 'element' property
 *
 * @param data The variant data to include in the response
 * @returns Standardized MCP tool success response with variant-specific optimizations
 */
export const createVariantMcpToolSuccessResponse = (
  data: any,
): McpToolSuccessResponse => {
  // Phase 1: General recursive cleaning
  const cleaned = removeEmptyValues(data);

  // Phase 2: Remove elements with only element property
  const optimized = removeEmptyElementsFromVariant(cleaned);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(optimized),
      },
    ],
  };
};
