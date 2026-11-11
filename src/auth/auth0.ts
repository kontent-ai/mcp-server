import { createHash } from "node:crypto";
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
import { throwError } from "../utils/throwError.js";

export type Auth0AuthOptions = {
  /** Full domain of the Auth0 tenant used for token verification, e.g. "tenant.us.auth0.com". */
  readonly domain: string;
  /**
   * Fixed Auth0 API identifier for this MCP server (its OAuth resource
   * identity). Stays the same across every environment/deployment — it is an
   * opaque identifier for token-audience matching, not a URL anyone connects
   * to, so it does not need to be reachable.
   */
  readonly audience: string;
  /**
   * The base URL this specific running instance is actually reachable at
   * (e.g. `http://localhost:3001` locally, the real public URL in
   * production). Used only to tell clients where to fetch this server's own
   * OAuth Protected Resource Metadata from — it must be a real, reachable
   * address, unlike `audience`.
   */
  readonly metadataBaseUrl: URL;
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
  audience,
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
    // The fixed audience identifier, not metadataBaseUrl — this becomes the
    // `resource` field published inside the metadata document itself.
    resourceServerUrl: new URL(audience),
    resourceName,
    scopesSupported: ["openid"],
  });
};

const createAuthMiddleware = (
  { metadataBaseUrl }: Auth0AuthOptions,
  verifyAccessToken: (token: string) => Promise<AuthInfo>,
): RequestHandler =>
  requireBearerAuth({
    // Must be where THIS instance is actually reachable, so clients can
    // really fetch it — unlike the fixed `audience`, which isn't a live URL.
    resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(metadataBaseUrl),
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

// --- On-Behalf-Of exchange for calling the Kontent.ai Management API ------
//
// A caller's Auth0 access token is only valid for *this* MCP server's own
// audience — Management API calls need a separate token minted for MAPI's
// audience, obtained via Auth0's On-Behalf-Of (RFC 8693) token exchange.
// This requires the MCP server's own Auth0 Application to be a confidential
// client (MCP_AUTH0_CLIENT_ID/SECRET) with OBO exchange enabled and a Client
// Grant authorizing it against MAPI's audience (MAPI_AUTH0_AUDIENCE) — see
// project notes for the Auth0-side setup.

type CachedMapiToken = {
  readonly accessToken: string;
  /** Seconds since epoch; refreshed a little early rather than exactly at expiry. */
  readonly expiresAt: number;
};

// Keyed by a hash of the source token rather than the token itself, so a raw
// bearer token isn't held in memory for the lifetime of the cache entry.
const mapiTokenCache = new Map<string, CachedMapiToken>();

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

let mapiExchangeClient: ApiClient | undefined;

const getMapiExchangeClient = (): ApiClient => {
  if (!mapiExchangeClient) {
    mapiExchangeClient = new ApiClient({
      domain:
        process.env.AUTH0_DOMAIN ??
        throwError("AUTH0_DOMAIN environment variable is not set."),
      audience:
        process.env.MAPI_AUTH0_AUDIENCE ??
        throwError("MAPI_AUTH0_AUDIENCE environment variable is not set."),
      clientId:
        process.env.MCP_AUTH0_CLIENT_ID ??
        throwError("MCP_AUTH0_CLIENT_ID environment variable is not set."),
      clientSecret:
        process.env.MCP_AUTH0_CLIENT_SECRET ??
        throwError("MCP_AUTH0_CLIENT_SECRET environment variable is not set."),
    });
  }
  return mapiExchangeClient;
};

/**
 * Exchanges a verified caller access token (already validated against this
 * MCP server's own audience) for a Management API-audience access token via
 * Auth0 On-Behalf-Of token exchange. Cached per source token until shortly
 * before it expires, since every MAPI-calling tool would otherwise pay a
 * network round trip to Auth0 on every single call.
 */
export const exchangeForMapiToken = async (
  accessToken: string,
): Promise<string> => {
  const cacheKey = hashToken(accessToken);
  const cached = mapiTokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() / 1000) {
    return cached.accessToken;
  }

  const mapiAudience =
    process.env.MAPI_AUTH0_AUDIENCE ??
    throwError("MAPI_AUTH0_AUDIENCE environment variable is not set.");
  const result = await getMapiExchangeClient().getTokenOnBehalfOf(accessToken, {
    audience: mapiAudience,
  });

  mapiTokenCache.set(cacheKey, {
    accessToken: result.accessToken,
    expiresAt: result.expiresAt - 30,
  });

  return result.accessToken;
};
