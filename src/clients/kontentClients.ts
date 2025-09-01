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
 * @returns Management API client instance
 */
export const createMapiClient = (
  environmentId?: string,
  apiKey?: string,
  config?: Pick<AppConfiguration, "manageApiUrl"> | null,
) => {
  return createManagementClient({
    apiKey:
      apiKey ??
      process.env.KONTENT_API_KEY ??
      throwError("KONTENT_API_KEY is not set"),
    environmentId:
      environmentId ??
      process.env.KONTENT_ENVIRONMENT_ID ??
      throwError("KONTENT_ENVIRONMENT_ID is not set"),
    headers: [
      {
        header: sourceTrackingHeaderName,
        value: `${packageJson.name};${packageJson.version}`,
      },
    ],
    baseUrl: config ? `${config.manageApiUrl}v2` : undefined,
  });
};
