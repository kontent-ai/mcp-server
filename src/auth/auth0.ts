import { ApiClient, VerifyAccessTokenError } from "@auth0/auth0-api-js";
import { discoverAuthorizationServerMetadata } from "@modelcontextprotocol/sdk/client/auth.js";
import { InvalidTokenError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import {
  getOAuthProtectedResourceMetadataUrl,
  mcpAuthMetadataRouter,
} from "@modelcontextprotocol/sdk/server/auth/router.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { RequestHandler } from "express";

export type Auth0AuthOptions = {
  /** Full domain of the Auth0 tenant used for token verification, e.g. "tenant.us.auth0.com". */
  readonly domain: string;
  /** Expected Auth0 API audience for this MCP server. */
  readonly audience: string;
  /** Base URL of this MCP server, used as the OAuth protected resource identifier. */
  readonly resourceServerUrl: URL;
  /** Human-readable server name, exposed in protected resource metadata. */
  readonly resourceName: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/**
 * Creates a verifier that validates Auth0-issued JWT access tokens (signature,
 * issuer, expiration, audience) and maps the verified claims onto the MCP SDK's
 * AuthInfo shape.
 */
const createVerifier = ({ domain, audience }: Auth0AuthOptions) => {
  const apiClient = new ApiClient({ domain, audience });

  return async (token: string): Promise<AuthInfo> => {
    try {
      const decoded = await apiClient.verifyAccessToken({ accessToken: token });

      // TEMPORARY DEBUG LOGGING — remove before merging.
      console.log("[auth0 debug] verified access token claims:", decoded);

      if (!isNonEmptyString(decoded.sub)) {
        throw new InvalidTokenError(
          "Token is missing required subject (sub) claim.",
        );
      }

      const clientId = isNonEmptyString(decoded.client_id)
        ? decoded.client_id
        : isNonEmptyString(decoded.azp)
          ? decoded.azp
          : null;
      if (!clientId) {
        throw new InvalidTokenError(
          "Token is missing required client identification (client_id or azp claim).",
        );
      }

      return {
        token,
        clientId,
        scopes:
          typeof decoded.scope === "string"
            ? decoded.scope.split(" ").filter(Boolean)
            : [],
        ...(decoded.exp && { expiresAt: decoded.exp }),
        extra: {
          sub: decoded.sub,
          ...(isNonEmptyString(decoded.client_id) && {
            client_id: decoded.client_id,
          }),
          ...(isNonEmptyString(decoded.azp) && { azp: decoded.azp }),
          ...(isNonEmptyString(decoded.name) && { name: decoded.name }),
          ...(isNonEmptyString(decoded.email) && { email: decoded.email }),
        },
      };
    } catch (error) {
      if (error instanceof VerifyAccessTokenError) {
        throw new InvalidTokenError(error.message);
      }
      throw error;
    }
  };
};

/**
 * Discovers the Auth0 tenant's OAuth metadata and returns a router exposing
 * this server's OAuth Protected Resource Metadata (RFC 9728) for MCP client
 * discovery.
 */
const createAuthMetadataRouter = async ({
  domain,
  resourceServerUrl,
  resourceName,
}: Auth0AuthOptions) => {
  const oauthMetadata = await discoverAuthorizationServerMetadata(
    new URL(`https://${domain}`),
  );
  if (!oauthMetadata) {
    throw new Error(`Failed to fetch OAuth metadata from ${domain}`);
  }

  return mcpAuthMetadataRouter({
    oauthMetadata,
    resourceServerUrl,
    resourceName,
    scopesSupported: ["openid"],
  });
};

const createAuthMiddleware = (
  { resourceServerUrl }: Auth0AuthOptions,
  verifyAccessToken: (token: string) => Promise<AuthInfo>,
): RequestHandler =>
  requireBearerAuth({
    resourceMetadataUrl:
      getOAuthProtectedResourceMetadataUrl(resourceServerUrl),
    verifier: { verifyAccessToken },
  });

/**
 * Builds the pieces needed to protect the Streamable HTTP MCP endpoint with
 * Auth0: a router exposing OAuth Protected Resource Metadata for client
 * discovery, and an Express middleware that validates Bearer tokens against
 * the configured Auth0 tenant/audience and populates `req.auth`.
 */
export const createAuth0Auth = async (options: Auth0AuthOptions) => ({
  metadataRouter: await createAuthMetadataRouter(options),
  authMiddleware: createAuthMiddleware(options, createVerifier(options)),
});
