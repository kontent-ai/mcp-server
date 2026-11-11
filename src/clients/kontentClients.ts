import { createManagementClient } from "@kontent-ai/management-sdk";
import packageJson from "../../package.json" with { type: "json" };
import { exchangeForMapiToken } from "../auth/auth0.js";
import { throwError } from "../utils/throwError.js";

const sourceTrackingHeaderName = "X-KC-SOURCE";

export const agentMetadataHeader = {
  header: "X-KC-Agent-Metadata",
  value: "true",
};

/**
 * Creates a Kontent.ai Management API client.
 * @param environmentId Optional environment ID (defaults to process.env.KONTENT_ENVIRONMENT_ID)
 * @param callerAccessToken Optional caller credential. Over Streamable HTTP this is the caller's
 *   verified Auth0 access token, which gets exchanged for a Management API-audience token via
 *   On-Behalf-Of before use. Omitted for STDIO, which falls back to the literal
 *   process.env.KONTENT_API_KEY Management API key — never exchanged.
 * @param additionalHeaders Optional additional headers to include in requests
 * @returns Management API client instance
 */
export const createMapiClient = async (
  environmentId?: string,
  callerAccessToken?: string,
  additionalHeaders?: Array<{ header: string; value: string }>,
) => {
  const allHeaders = [
    {
      header: sourceTrackingHeaderName,
      value: `${packageJson.name};${packageJson.version}`,
    },
    ...(additionalHeaders || []),
  ];

  const manageApiUrl = process.env.manageApiUrl;

  const apiKey = callerAccessToken
    ? await exchangeForMapiToken(callerAccessToken)
    : (process.env.KONTENT_API_KEY ?? throwError("KONTENT_API_KEY is not set"));

  return createManagementClient({
    apiKey,
    environmentId:
      environmentId ??
      process.env.KONTENT_ENVIRONMENT_ID ??
      throwError("KONTENT_ENVIRONMENT_ID is not set"),
    baseUrl: manageApiUrl ? `${manageApiUrl}v2` : undefined,
    headers: allHeaders,
  });
};
