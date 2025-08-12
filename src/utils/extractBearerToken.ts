import type { Request } from "express";

/**
 * Extracts Bearer token from request authorization header
 * @param req Express request object
 * @returns Bearer token string or null if not found
 */
export const extractBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return null;
};
