import { SharedModels } from "@kontent-ai/management-sdk";
import appInsights from "applicationinsights";
import type { AxiosError } from "axios";
import {
  sanitizeErrorForLog,
  sanitizeTelemetry,
  sanitizeUnknownValue,
  sanitizeUrl,
} from "./telemetrySanitizer.js";

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
  safeError.stack = error.originalError?.stack || safeError.stack;

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
  safeError.stack = error.stack || safeError.stack;

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
    exception: new Error(`Non-error thrown: ${sanitizeUnknownValue(error)}`),
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

    if (error?.isAxiosError) {
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

export function createTelemetryProcessor() {
  // Per-processor rather than module-level: production creates exactly one, so the behaviour is
  // the same, and tests get a fresh flag instead of one that leaks across spec files.
  let sanitizationFailureReported = false;

  return (envelope: any) => {
    try {
      sanitizeTelemetry(envelope);

      if (envelope.data?.baseData) {
        envelope.data.baseData.properties =
          envelope.data.baseData.properties || {};
        envelope.data.baseData.properties["component.name"] = "mcp-server";
        envelope.data.baseData.properties["component.location"] =
          process.env.projectLocation || "unknown";
      }
      return true;
    } catch {
      // Dropping the item is deliberate. A throw here is caught by Application Insights,
      // which then sends the unsanitized envelope anyway AND dumps it to its internal log;
      // only returning false rejects it. Reported once so a rejecting sanitizer is not
      // silently invisible - deliberately without any envelope content.
      if (!sanitizationFailureReported) {
        sanitizationFailureReported = true;
        console.error(
          "Telemetry sanitization failed; dropping the affected telemetry item.",
        );
      }
      return false;
    }
  };
}

const defaultFlushTimeoutMs = 2000;

/**
 * Sends anything still buffered. Telemetry is batched (default 15s), so a process that exits
 * without this loses whatever was tracked immediately beforehand.
 * Always resolves - a failed flush must never block shutdown.
 */
export function flushTelemetry(
  timeoutMs: number = defaultFlushTimeoutMs,
): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!isInitialized || !appInsights.defaultClient) {
        resolve();
        return;
      }

      let settled = false;
      let timer: NodeJS.Timeout | undefined;

      const done = () => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        resolve();
      };

      // Order matters: Channel.triggerSend() fires the callback SYNCHRONOUSLY when the buffer
      // is empty ("no data to send"), so `timer` must already be assigned when done() runs,
      // or clearTimeout() is a no-op and the event loop stays alive for timeoutMs.
      // The timer is deliberately NOT unref'd: every caller exits right after awaiting this,
      // and an unref'd timer would let the process exit with code 0 before its process.exit(1)
      // if the sender never invoked the callback.
      timer = setTimeout(done, timeoutMs);

      appInsights.defaultClient.flush({ callback: () => done() });
    } catch {
      resolve();
    }
  });
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
      .setAutoCollectPerformance(false)
      .setAutoCollectIncomingRequestAzureFunctions(false)
      .setAutoCollectPreAggregatedMetrics(false);

    // Must be attached before start(): auto-collected exceptions in the gap would bypass it.
    // `defaultClient` is created by setup(), so it already exists here.
    appInsights.defaultClient.addTelemetryProcessor(createTelemetryProcessor());

    appInsights.start();
    isInitialized = true;
  } catch (error) {
    // Nothing else can carry this one: telemetry has just failed to initialize, so there is no
    // trackException to fall back on.
    console.error(
      "Failed to initialize Application Insights:",
      sanitizeErrorForLog(error),
    );
  }
}
