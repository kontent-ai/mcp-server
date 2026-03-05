/**
 * Extracts user ID from JWT token's uid claim.
 * Decodes the JWT payload using base64url.
 * @param token JWT token string
 * @returns User ID string or null if decoding fails
 */
export const extractUserIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    );

    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
};
