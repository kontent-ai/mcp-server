import { createManagementClient } from "@kontent-ai/management-sdk";
import packageJson from "../../package.json" with { type: "json" };
import { resolveCredentials } from "./credentials.js";

const sourceTrackingHeaderName = "X-KC-SOURCE";

export const agentMetadataHeader = {
  header: "X-KC-Agent-Metadata",
  value: "true",
};

/**
 * Creates a Kontent.ai Management API client.
 *
 * Credentials are never read from the environment here. They come from the
 * request in multi-tenant mode, or from the single-tenant credentials the stdio
 * entry point configures at startup - see `resolveCredentials`.
 *
 * @param environmentId Environment ID the request runs under
 * @param apiKey Management API key the request runs under
 * @param additionalHeaders Optional additional headers to include in requests
 * @returns Management API client instance
 */
export const createMapiClient = (
  environmentId: string | undefined,
  apiKey: string | undefined,
  additionalHeaders?: Array<{ header: string; value: string }>,
) => {
  const credentials = resolveCredentials(environmentId, apiKey);

  const allHeaders = [
    {
      header: sourceTrackingHeaderName,
      value: `${packageJson.name};${packageJson.version}`,
    },
    ...(additionalHeaders || []),
  ];

  const manageApiUrl = process.env.manageApiUrl;

  return createManagementClient({
    apiKey: credentials.apiKey,
    environmentId: credentials.environmentId,
    baseUrl: manageApiUrl ? `${manageApiUrl}v2` : undefined,
    headers: allHeaders,
  });
};
