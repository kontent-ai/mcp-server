import { createManagementClient } from "@kontent-ai/management-sdk";
import packageJson from "../../package.json" with { type: "json" };
import type { AppConfiguration } from "../config/appConfiguration.js";
import { throwError } from "../utils/throwError.js";

const sourceTrackingHeaderName = "X-KC-SOURCE";

/**
 * Creates a Kontent.ai Management API client
 * @param environmentId Optional environment ID (defaults to process.env.KONTENT_ENVIRONMENT_ID)
 * @param apiKey Optional API key (defaults to process.env.KONTENT_API_KEY)
 * @param config Optional configuration object
 * @param additionalHeaders Optional additional headers to include in requests
 * @returns Management API client instance
 */
export const createMapiClient = (
  environmentId?: string,
  apiKey?: string,
  config?: Pick<AppConfiguration, "manageApiUrl"> | null,
  additionalHeaders?: Array<{ header: string; value: string }>,
) => {
  const allHeaders = [
    {
      header: sourceTrackingHeaderName,
      value: `${packageJson.name};${packageJson.version}`,
    },
    ...(additionalHeaders || []),
  ];

  const manageApiUrl =
    config?.manageApiUrl ?? process.env.KONTENT_MANAGE_API_URL;

  return createManagementClient({
    apiKey:
      apiKey ??
      process.env.KONTENT_API_KEY ??
      throwError("KONTENT_API_KEY is not set"),
    environmentId:
      environmentId ??
      process.env.KONTENT_ENVIRONMENT_ID ??
      throwError("KONTENT_ENVIRONMENT_ID is not set"),
    headers: allHeaders,
    baseUrl: manageApiUrl && `${manageApiUrl}v2`,
  });
};
