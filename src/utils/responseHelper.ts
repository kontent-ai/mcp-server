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

export function isEmptyOrDefault(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string" && value === "") {
    return true;
  }

  if (typeof value === "string" && value === "<p><br/></p>") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

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

export function removeEmptyElementsFromVariant(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeEmptyElementsFromVariant(item));
  }

  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === "elements" && Array.isArray(value)) {
      const filteredElements = value
        .filter((element) => {
          if (typeof element !== "object" || element === null) {
            return true;
          }
          const keys = Object.keys(element);
          return !(keys.length === 1 && keys[0] === "element");
        })
        .map((element) => removeEmptyElementsFromVariant(element));

      if (filteredElements.length > 0) {
        result[key] = filteredElements;
      }
    } else {
      const processedValue = removeEmptyElementsFromVariant(value);
      if (processedValue !== undefined) {
        result[key] = processedValue;
      }
    }
  }

  return result;
}

export function removeEmptyValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (typeof obj !== "object") {
    return isEmptyOrDefault(obj) ? undefined : obj;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj
      .map((item) => removeEmptyValues(item))
      .filter((item) => item !== undefined);

    return cleaned.length === 0 ? undefined : cleaned;
  }

  const cleaned: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const cleanedValue = removeEmptyValues(value);

    if (cleanedValue !== undefined) {
      cleaned[key] = cleanedValue;
    }
  }

  const keys = Object.keys(cleaned);
  return keys.length === 0 ? undefined : cleaned;
}

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

export const createVariantMcpToolSuccessResponse = (
  data: any,
): McpToolSuccessResponse => {
  const cleaned = removeEmptyValues(data);
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
