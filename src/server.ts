import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTool as registerGetItemMapi } from "./tools/get-item-mapi.js";
import { registerTool as registerGetItemDapi } from "./tools/get-item-dapi.js";
import { registerTool as registerGetVariantMapi } from "./tools/get-variant-mapi.js";
import { registerTool as registerGetTypeMapi } from "./tools/get-type-mapi.js";
import { registerTool as registerListContentTypesMapi } from "./tools/list-content-types-mapi.js";
import { registerTool as registerListLanguagesMapi } from "./tools/list-languages-mapi.js";
import { registerTool as registerGetAssetMapi } from "./tools/get-asset-mapi.js";
import { registerTool as registerListAssetsMapi } from "./tools/list-assets-mapi.js";
import { registerTool as registerAddContentTypeMapi } from "./tools/add-content-type-mapi.js";
import { registerTool as registerAddContentTypeSnippetMapi } from "./tools/add-content-type-snippet-mapi.js";
import { registerTool as registerGetTypeSnippetMapi } from "./tools/get-type-snippet-mapi.js";
import { registerTool as registerListContentTypeSnippetsMapi } from "./tools/list-content-type-snippets-mapi.js";
import { registerTool as registerAddTaxonomyGroupMapi } from "./tools/add-taxonomy-group-mapi.js";
import { registerTool as registerListTaxonomyGroupsMapi } from "./tools/list-taxonomy-groups-mapi.js";
import { registerTool as registerGetTaxonomyGroupMapi } from "./tools/get-taxonomy-group-mapi.js";
import { registerTool as registerListWebhooksMapi } from "./tools/list-webhooks-mapi.js";
import { registerTool as registerGetWebhookMapi } from "./tools/get-webhook-mapi.js";
import { registerTool as registerAddWebhookMapi } from "./tools/add-webhook-mapi.js";
import packageJson from "../package.json" with { type: "json" };

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
  registerGetItemMapi(server);
  registerGetItemDapi(server);
  registerGetVariantMapi(server);
  registerGetTypeMapi(server);
  registerListContentTypesMapi(server);
  registerListLanguagesMapi(server);
  registerGetAssetMapi(server);
  registerListAssetsMapi(server);
  registerAddContentTypeMapi(server);
  registerAddContentTypeSnippetMapi(server);
  registerGetTypeSnippetMapi(server);
  registerListContentTypeSnippetsMapi(server);
  registerAddTaxonomyGroupMapi(server);
  registerListTaxonomyGroupsMapi(server);
  registerGetTaxonomyGroupMapi(server);
  registerListWebhooksMapi(server);
  registerGetWebhookMapi(server);
  registerAddWebhookMapi(server);

  return { server };
};