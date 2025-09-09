import { load } from "@azure/app-configuration-provider";
import { DefaultAzureCredential } from "@azure/identity";

export interface AppConfiguration {
  manageApiUrl?: string;
  applicationInsightsConnectionString?: string;
  projectLocation?: string;
}

function loadIndexedEnvVars(prefix: string): string[] {
  const values: string[] = [];
  let index = 0;

  while (true) {
    const envVar = process.env[`${prefix}__${index}`];
    if (!envVar) break;

    const trimmed = envVar.trim();
    if (trimmed) {
      values.push(trimmed);
    }
    index++;
  }

  return values;
}

function getConfigValue(configMap: any, key: string): string | undefined {
  const value = configMap.get(key);
  return value && typeof value === "string" ? value : undefined;
}

export async function loadAppConfiguration(): Promise<AppConfiguration | null> {
  try {
    const appConfigEndpoint = process.env.ConfigStore__Endpoints__0;
    const labels = loadIndexedEnvVars("ConfigStore__Labels");

    if (!appConfigEndpoint || labels.length === 0) {
      return null;
    }

    const selectors = labels.flatMap((label) => [
      { keyFilter: "ApplicationInsights:*", labelFilter: label },
      { keyFilter: "Global:Runtime:*", labelFilter: label },
      { keyFilter: "Draft:ManageApi:*", labelFilter: label },
    ]);

    const credential = new DefaultAzureCredential();
    const configMap = await load(appConfigEndpoint, credential, {
      selectors: selectors,
      keyVaultOptions: {
        credential: credential,
      },
    });

    return {
      applicationInsightsConnectionString: getConfigValue(
        configMap,
        "ApplicationInsights:ConnectionString",
      ),
      projectLocation: getConfigValue(
        configMap,
        "Global:Runtime:ProjectLocation",
      ),
      manageApiUrl: getConfigValue(configMap, "Draft:ManageApi:Url"),
    };
  } catch (error) {
    console.log("Failed to load App Configuration:", error);
    return null;
  }
}
