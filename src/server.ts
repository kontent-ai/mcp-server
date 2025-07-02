import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../package.json" with { type: "json" };
import { registerTool as registerAddContentItemMapi } from "./tools/add-content-item-mapi.js";
import { registerTool as registerAddContentTypeMapi } from "./tools/add-content-type-mapi.js";
import { registerTool as registerAddContentTypeSnippetMapi } from "./tools/add-content-type-snippet-mapi.js";
import { registerTool as registerPatchContentTypeMapi } from "./tools/patch-content-type-mapi.js";
import { registerTool as registerAddTaxonomyGroupMapi } from "./tools/add-taxonomy-group-mapi.js";
import { registerTool as registerDeleteContentItemMapi } from "./tools/delete-content-item-mapi.js";
import { registerTool as registerDeleteLanguageVariantMapi } from "./tools/delete-language-variant-mapi.js";
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
import { registerTool as registerUpdateContentItemMapi } from "./tools/update-content-item-mapi.js";
import { registerTool as registerUpsertLanguageVariantMapi } from "./tools/upsert-language-variant-mapi.js";

// Create server instance
export const createServer = () => {
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
  registerGetItemMapi(server);
  registerGetItemDapi(server);
  registerGetVariantMapi(server);
  registerGetTypeMapi(server);
  registerListContentTypesMapi(server);
  registerListLanguagesMapi(server);
  registerGetAssetMapi(server);
  registerListAssetsMapi(server);
  registerAddContentTypeMapi(server);
  registerPatchContentTypeMapi(server);
  registerAddContentTypeSnippetMapi(server);
  registerGetTypeSnippetMapi(server);
  registerListContentTypeSnippetsMapi(server);
  registerAddTaxonomyGroupMapi(server);
  registerListTaxonomyGroupsMapi(server);
  registerGetTaxonomyGroupMapi(server);
  registerAddContentItemMapi(server);
  registerUpdateContentItemMapi(server);
  registerDeleteContentItemMapi(server);
  registerUpsertLanguageVariantMapi(server);
  registerDeleteLanguageVariantMapi(server);

  return { server };
};
