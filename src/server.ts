import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../package.json" with { type: "json" };
import type { AppConfiguration } from "./config/appConfiguration.js";
import { registerTool as registerAddContentItemMapi } from "./tools/add-content-item-mapi.js";
import { registerTool as registerAddContentTypeMapi } from "./tools/add-content-type-mapi.js";
import { registerTool as registerAddContentTypeSnippetMapi } from "./tools/add-content-type-snippet-mapi.js";
import { registerTool as registerAddTaxonomyGroupMapi } from "./tools/add-taxonomy-group-mapi.js";
import { registerTool as registerChangeVariantWorkflowStepMapi } from "./tools/change-variant-workflow-step-mapi.js";
import { registerTool as registerCreateVariantVersionMapi } from "./tools/create-variant-version-mapi.js";
import { registerTool as registerDeleteContentItemMapi } from "./tools/delete-content-item-mapi.js";
import { registerTool as registerDeleteContentTypeMapi } from "./tools/delete-content-type-mapi.js";
import { registerTool as registerDeleteLanguageVariantMapi } from "./tools/delete-language-variant-mapi.js";
import { registerTool as registerFilterVariantsMapi } from "./tools/filter-variants-mapi.js";
import { registerTool as registerGetAssetMapi } from "./tools/get-asset-mapi.js";
import { registerTool as registerGetInitialContext } from "./tools/get-initial-context.js";
import { registerTool as registerGetItemDapi } from "./tools/get-item-dapi.js";
import { registerTool as registerGetItemMapi } from "./tools/get-item-mapi.js";
import { registerTool as registerGetTaxonomyGroupMapi } from "./tools/get-taxonomy-group-mapi.js";
import { registerTool as registerGetTypeMapi } from "./tools/get-type-mapi.js";
import { registerTool as registerGetTypeSnippetMapi } from "./tools/get-type-snippet-mapi.js";
import { registerTool as registerGetVariantMapi } from "./tools/get-variant-mapi.js";
import { registerTool as registerListAssetsMapi } from "./tools/list-assets-mapi.js";
import { registerTool as registerListContentTypeSnippetsMapi } from "./tools/list-content-type-snippets-mapi.js";
import { registerTool as registerListContentTypesMapi } from "./tools/list-content-types-mapi.js";
import { registerTool as registerListLanguagesMapi } from "./tools/list-languages-mapi.js";
import { registerTool as registerListTaxonomyGroupsMapi } from "./tools/list-taxonomy-groups-mapi.js";
import { registerTool as registerListWorkflowsMapi } from "./tools/list-workflows-mapi.js";
import { registerTool as registerPatchContentTypeMapi } from "./tools/patch-content-type-mapi.js";
import { registerTool as registerPublishVariantMapi } from "./tools/publish-variant-mapi.js";
import { registerTool as registerUnpublishVariantMapi } from "./tools/unpublish-variant-mapi.js";
import { registerTool as registerUpdateContentItemMapi } from "./tools/update-content-item-mapi.js";
import { registerTool as registerUpsertLanguageVariantMapi } from "./tools/upsert-language-variant-mapi.js";

// Create server instance
export const createServer = (config: AppConfiguration | null) => {
  const server = new McpServer({
    name: "kontent-ai",
    version: packageJson.version,
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register all tools
  registerGetInitialContext(server);
  registerGetItemMapi(server, config);
  registerGetItemDapi(server, config);
  registerGetVariantMapi(server, config);
  registerGetTypeMapi(server, config);
  registerListContentTypesMapi(server, config);
  registerDeleteContentTypeMapi(server, config);
  registerListLanguagesMapi(server, config);
  registerGetAssetMapi(server, config);
  registerListAssetsMapi(server, config);
  registerAddContentTypeMapi(server, config);
  registerPatchContentTypeMapi(server, config);
  registerAddContentTypeSnippetMapi(server, config);
  registerGetTypeSnippetMapi(server, config);
  registerListContentTypeSnippetsMapi(server, config);
  registerAddTaxonomyGroupMapi(server, config);
  registerListTaxonomyGroupsMapi(server, config);
  registerGetTaxonomyGroupMapi(server, config);
  registerAddContentItemMapi(server, config);
  registerUpdateContentItemMapi(server, config);
  registerDeleteContentItemMapi(server, config);
  registerUpsertLanguageVariantMapi(server, config);
  registerCreateVariantVersionMapi(server, config);
  registerDeleteLanguageVariantMapi(server, config);
  registerListWorkflowsMapi(server, config);
  registerChangeVariantWorkflowStepMapi(server, config);
  registerFilterVariantsMapi(server, config);
  registerPublishVariantMapi(server, config);
  registerUnpublishVariantMapi(server, config);

  return { server };
};
