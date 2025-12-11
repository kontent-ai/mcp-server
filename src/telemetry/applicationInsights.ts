import { SharedModels } from "@kontent-ai/management-sdk";
import appInsights from "applicationinsights";
import type { AxiosError } from "axios";
import { sanitizeTelemetry, sanitizeUrl } from "./telemetrySanitizer.js";

let isInitialized = false;

function trackKontentApiError(
  error: SharedModels.ContentManagementBaseKontentError,
  context?: string,
): void {
  if (error.validationErrors && error.validationErrors.length > 0) {
    // Don't log 400 responses as exceptions
    return;
  }

  const safeError = new Error(error.message);
  safeError.stack = error.originalError.stack || safeError.stack;

  appInsights.defaultClient.trackException({
    exception: safeError,
    properties: {
      errorType: "KontentManagementApiError",
      errorCode: error.errorCode,
      requestId: error.requestId,
      context: context,
    },
  });
}

function trackHttpError(error: AxiosError, context?: string): void {
  let errorMessage: string;
  let properties: Record<string, string | number | undefined> = {
    errorType: "HttpError",
    axiosErrorCode: error.code,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url ? sanitizeUrl(error.config.url) : undefined,
    context: context,
  };

  if (error.response) {
    errorMessage = `HTTP ${error.response.status} ${error.response.statusText || "Error"}`;
    properties = {
      ...properties,
      scenario: "ServerResponseError",
      status: error.response.status,
      statusText: error.response.statusText,
    };
  } else if (error.request) {
    errorMessage = "Network Error - No response received";
    properties = {
      ...properties,
      scenario: "NetworkError",
      timeout: error.config?.timeout,
    };
  } else {
    errorMessage = `Request Setup Error: ${error.message}`;
    properties = {
      ...properties,
      scenario: "RequestSetupError",
    };
  }

  const safeError = new Error(errorMessage);
  safeError.stack = error.stack || safeError.stack;

  appInsights.defaultClient.trackException({
    exception: safeError,
    properties,
  });
}

function trackGeneralError(error: Error, context?: string): void {
  const safeError = new Error(error.message);
  safeError.stack = error.stack;

  appInsights.defaultClient.trackException({
    exception: safeError,
    properties: {
      errorType: "JavaScriptError",
      name: error.name,
      context: context,
    },
  });
}

function trackUnknownError(error: any, context?: string): void {
  appInsights.defaultClient.trackException({
    exception: new Error("An error occurred"),
    properties: {
      errorType: "UnknownError",
      actualType: typeof error,
      context: context,
    },
  });
}

export function trackException(error: any, context?: string): void {
  try {
    if (!isInitialized || !appInsights.defaultClient) {
      return;
    }

    if (error instanceof SharedModels.ContentManagementBaseKontentError) {
      trackKontentApiError(error, context);
      return;
    }

    if (error.isAxiosError) {
      trackHttpError(error, context);
      return;
    }

    if (error instanceof Error) {
      trackGeneralError(error, context);
      return;
    }

    trackUnknownError(error, context);
  } catch {
    // Silently fail - tracking should never break the application
  }
}

export function trackServerStartup(version: string): void {
  try {
    if (isInitialized && appInsights.defaultClient) {
      appInsights.defaultClient.trackEvent({
        name: "ServerStartup",
        properties: {
          version: version,
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
        },
      });
    }
  } catch {
    // Silently fail - tracking should never break the application
  }
}

function createTelemetryProcessor() {
  return (envelope: any) => {
    sanitizeTelemetry(envelope);

    if (envelope.data?.baseData) {
      envelope.data.baseData.properties =
        envelope.data.baseData.properties || {};
      envelope.data.baseData.properties["component.name"] = "mcp-server";
      envelope.data.baseData.properties["component.location"] =
        process.env.projectLocation || "unknown";
    }
    return true;
  };
}

export function initializeApplicationInsights(): void {
  try {
    const connectionString = process.env.appInsightsConnectionString;
    if (!connectionString) {
      return;
    }

    appInsights
      .setup(connectionString)
      .setAutoCollectExceptions(true)
      .setAutoCollectRequests(true)
      .setAutoCollectConsole(false)
      .setAutoCollectDependencies(false)
      .setAutoDependencyCorrelation(false)
      .setAutoCollectHeartbeat(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectIncomingRequestAzureFunctions(false)
      .setAutoCollectPreAggregatedMetrics(false)
      .start();

    isInitialized = true;

    appInsights.defaultClient.addTelemetryProcessor(createTelemetryProcessor());
  } catch (error) {
    console.log("Failed to initialize Application Insights:", error);
  }
}
