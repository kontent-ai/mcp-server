import { throwError } from "../utils/throwError.js";

export type MapiCredentials = {
  readonly environmentId: string;
  readonly apiKey: string;
};

export const missingCredentialsMessage =
  "No Kontent.ai credentials available. In multi-tenant (Streamable HTTP) mode every request must carry its own environment ID and API key; in single-tenant (stdio) mode they come from the server's environment at startup.";

export const partialCredentialsMessage =
  "Incomplete Kontent.ai credentials: the environment ID and the API key must be provided together.";

// Set by the stdio entry point in bin.ts and by nothing else. The Streamable
// HTTP entry point deliberately never sets it, so in multi-tenant mode there is
// nothing here for a request to fall back on: one that arrives without its own
// credentials fails instead of silently borrowing the process's.
let singleTenantCredentials: MapiCredentials | undefined;

/**
 * Supplies the credentials every request runs under in single-tenant (stdio)
 * mode. Returns a disposer, which exists so tests can restore the previous
 * state in a `finally` block.
 */
export const setSingleTenantCredentials = (
  credentials: MapiCredentials,
): (() => void) => {
  const previous = singleTenantCredentials;
  singleTenantCredentials = credentials;

  return () => {
    singleTenantCredentials = previous;
  };
};

/**
 * Resolves the credentials a request runs under. Credentials supplied by the
 * caller always win; the single-tenant ones apply only when the caller supplied
 * none at all. A half pair is rejected rather than completed from them, so a
 * request can never run under a mix of two tenants'.
 *
 * Empty strings count as missing - `extractBearerToken` yields `""` for a bare
 * `Authorization: Bearer` header.
 */
export const resolveCredentials = (
  environmentId: string | undefined,
  apiKey: string | undefined,
): MapiCredentials => {
  if (environmentId && apiKey) {
    return { environmentId, apiKey };
  }

  if (environmentId || apiKey) {
    throwError(partialCredentialsMessage);
  }

  return singleTenantCredentials ?? throwError(missingCredentialsMessage);
};
