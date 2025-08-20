import appInsights from "applicationinsights";

export interface ApplicationInsightsConfig {
  applicationInsightsConnectionString?: string;
  projectLocation?: string;
}

let isInitialized = false;

export function trackException(error: any): void {
  try {
    if (isInitialized && appInsights.defaultClient) {
      const exception =
        error instanceof Error ? error : new Error(String(error));
      appInsights.defaultClient.trackException({ exception });
    }
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

function createTelemetryProcessor(config: ApplicationInsightsConfig) {
  return (envelope: any) => {
    if (envelope.data?.baseData) {
      envelope.data.baseData.properties =
        envelope.data.baseData.properties || {};
      envelope.data.baseData.properties["component.name"] = "mcp-server";
      envelope.data.baseData.properties["component.location"] =
        config.projectLocation || "unknown";
    }
    return true;
  };
}

export function initializeApplicationInsights(
  config: ApplicationInsightsConfig | null,
  _version: string,
): void {
  try {
    if (!config?.applicationInsightsConnectionString) {
      return;
    }

    appInsights
      .setup(config.applicationInsightsConnectionString)
      .setAutoCollectExceptions(true)
      .setAutoCollectRequests(true)
      .start();

    isInitialized = true;

    appInsights.defaultClient.addTelemetryProcessor(
      createTelemetryProcessor(config),
    );
  } catch (error) {
    console.log("Failed to initialize Application Insights:", error);
  }
}
