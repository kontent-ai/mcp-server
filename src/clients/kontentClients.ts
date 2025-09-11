import { createManagementClient } from "@kontent-ai/management-sdk";
import packageJson from "../../package.json" with { type: "json" };
import { throwError } from "../utils/throwError.js";

const sourceTrackingHeaderName = "X-KC-SOURCE";

/**
 * Creates a Kontent.ai Management API client
 * @param environmentId Optional environment ID (defaults to process.env.KONTENT_ENVIRONMENT_ID)
 * @param apiKey Optional API key (defaults to process.env.KONTENT_API_KEY)
 * @param additionalHeaders Optional additional headers to include in requests
 * @returns Management API client instance test
 */
export const createMapiClient = (
  environmentId?: string,
  apiKey?: string,
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

  return createManagementClient({
    apiKey:
      apiKey ??
      process.env.KONTENT_API_KEY ??
      throwError("KONTENT_API_KEY is not set"),
    environmentId:
      environmentId ??
      process.env.KONTENT_ENVIRONMENT_ID ??
      throwError("KONTENT_ENVIRONMENT_ID is not set"),
    baseUrl: manageApiUrl ? `${manageApiUrl}v2` : undefined,
    headers: allHeaders,
  });
};
