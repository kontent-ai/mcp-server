/**
 * Validates if a string is a valid GUID format
 * @param guid String to validate
 * @returns true if valid GUID format, false otherwise
 */
export const isValidGuid = (guid: string): boolean => {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};
