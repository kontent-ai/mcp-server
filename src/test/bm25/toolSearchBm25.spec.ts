import * as assert from "node:assert";
import type MiniSearch from "minisearch";
import { before, describe, it } from "mocha";
import { allTools } from "../../tools/index.js";
import type { ToolDocument } from "./bm25.js";
import { createToolSearchIndex, searchTools } from "./bm25.js";

const topK = 5;

interface TestCase {
  /** Short, agent-style search query (2-5 words). */
  readonly query: string;
  /** Tool names that MUST appear in the top-k results. */
  readonly expected: ReadonlyArray<string>;
}

interface TestGroup {
  readonly name: string;
  readonly cases: ReadonlyArray<TestCase>;
}

const assertToolsFound = (
  index: MiniSearch<ToolDocument>,
  query: string,
  expectedTools: ReadonlyArray<string>,
): void => {
  // Search with a wider window so we can report the actual position of missed tools
  const wideResults = searchTools(index, query, 20);
  const wideNames = wideResults.map((r) => r.name);

  for (const expected of expectedTools) {
    const actualPosition = wideNames.indexOf(expected) + 1; // 0 means not found in top 20
    assert.ok(
      actualPosition >= 1 && actualPosition <= topK,
      `Query "${query}": "${expected}" found at position ${actualPosition || "beyond top 20"}, expected within top ${topK}. Top ${topK}: [${wideNames.slice(0, topK).join(", ")}]`,
    );
  }
};

// ---------------------------------------------------------------------------
// Test data — each group covers one entity/domain with query variations
// ---------------------------------------------------------------------------

const testGroups: ReadonlyArray<TestGroup> = [
  {
    name: "content type operations",
    cases: [
      // Action verb variations: create / add / new
      { query: "create content type", expected: [allTools.addContentTypeMapi.name] },
      { query: "add content type", expected: [allTools.addContentTypeMapi.name] },
      { query: "new content type", expected: [allTools.addContentTypeMapi.name] },
      // Synonym: model / schema / definition
      { query: "content model schema", expected: [allTools.addContentTypeMapi.name] },
      // Action verb variations: get / retrieve / fetch
      {
        query: "get content type",
        expected: [allTools.getTypeMapi.name, allTools.listContentTypesMapi.name],
      },
      { query: "retrieve content type", expected: [allTools.getTypeMapi.name] },
      { query: "fetch content type", expected: [allTools.getTypeMapi.name] },
      // Action verb variations: delete / remove
      { query: "delete content type", expected: [allTools.deleteContentTypeMapi.name] },
      { query: "remove content type", expected: [allTools.deleteContentTypeMapi.name] },
      // Action verb variations: modify / patch / edit / update
      {
        query: "modify content type elements",
        expected: [allTools.patchContentTypeMapi.name],
      },
      { query: "patch content type", expected: [allTools.patchContentTypeMapi.name] },
      { query: "edit content type fields", expected: [allTools.patchContentTypeMapi.name] },
      // Action verb variations: list / all / browse
      { query: "list content types", expected: [allTools.listContentTypesMapi.name] },
      { query: "all content types", expected: [allTools.listContentTypesMapi.name] },
      // Synonym: structure / definition / template
      { query: "content type structure", expected: [allTools.getTypeMapi.name] },
      { query: "content type definition", expected: [allTools.getTypeMapi.name] },
      { query: "content template fields", expected: [allTools.addContentTypeMapi.name] },
    ],
  },
  {
    name: "content type snippet operations",
    cases: [
      {
        query: "content type snippet",
        expected: [
          allTools.addContentTypeSnippetMapi.name,
          allTools.getTypeSnippetMapi.name,
          allTools.listContentTypeSnippetsMapi.name,
        ],
      },
      {
        query: "reusable snippet elements",
        expected: [allTools.addContentTypeSnippetMapi.name, allTools.getTypeSnippetMapi.name],
      },
      { query: "create snippet", expected: [allTools.addContentTypeSnippetMapi.name] },
      { query: "get snippet", expected: [allTools.getTypeSnippetMapi.name] },
      { query: "modify snippet", expected: [allTools.patchTypeSnippetMapi.name] },
      { query: "patch snippet", expected: [allTools.patchTypeSnippetMapi.name] },
      { query: "delete snippet", expected: [allTools.deleteTypeSnippetMapi.name] },
      { query: "remove snippet", expected: [allTools.deleteTypeSnippetMapi.name] },
    ],
  },
  {
    name: "content item operations",
    cases: [
      // create / add / new
      { query: "create content item", expected: [allTools.addContentItemMapi.name] },
      { query: "add content item", expected: [allTools.addContentItemMapi.name] },
      { query: "new content item", expected: [allTools.addContentItemMapi.name] },
      // get / retrieve
      { query: "get content item", expected: [allTools.getItemMapi.name] },
      { query: "retrieve content item", expected: [allTools.getItemMapi.name] },
      // update / edit
      { query: "update content item name", expected: [allTools.updateContentItemMapi.name] },
      { query: "edit content item", expected: [allTools.updateContentItemMapi.name] },
      // delete / remove
      { query: "delete content item", expected: [allTools.deleteContentItemMapi.name] },
      { query: "remove content item", expected: [allTools.deleteContentItemMapi.name] },
      // Synonym: page / entry / record
      { query: "create page entry", expected: [allTools.addContentItemMapi.name] },
      { query: "get content entry", expected: [allTools.getItemMapi.name] },
    ],
  },
  {
    name: "item variant / translation operations",
    cases: [
      // Translation-related
      {
        query: "translate content language",
        expected: [allTools.createLanguageVariantMapi.name, allTools.listVariantsItemMapi.name],
      },
      { query: "add translation", expected: [allTools.createLanguageVariantMapi.name] },
      { query: "create language version", expected: [allTools.createLanguageVariantMapi.name] },
      // create / add / new
      { query: "create item variant", expected: [allTools.createLanguageVariantMapi.name] },
      { query: "add item variant", expected: [allTools.createLanguageVariantMapi.name] },
      // get / retrieve / fetch (draft)
      { query: "get draft variant", expected: [allTools.getLatestVariantMapi.name] },
      { query: "fetch latest variant", expected: [allTools.getLatestVariantMapi.name] },
      {
        query: "retrieve draft content",
        expected: [allTools.getLatestVariantMapi.name],
      },
      // get / retrieve / fetch (published)
      {
        query: "get published content",
        expected: [allTools.getPublishedVariantMapi.name],
      },
      {
        query: "retrieve published variant",
        expected: [allTools.getPublishedVariantMapi.name],
      },
      {
        query: "live published variant",
        expected: [allTools.getPublishedVariantMapi.name],
      },
      // update / edit / write
      {
        query: "update item variant content",
        expected: [allTools.updateLanguageVariantMapi.name],
      },
      { query: "edit variant elements", expected: [allTools.updateLanguageVariantMapi.name] },
      { query: "write variant content", expected: [allTools.updateLanguageVariantMapi.name] },
      // New version
      {
        query: "create new draft version",
        expected: [allTools.createVariantVersionMapi.name],
      },
      {
        query: "new version published variant",
        expected: [allTools.createVariantVersionMapi.name],
      },
      // Bulk
      { query: "bulk get item variants", expected: [allTools.bulkGetItemsVariantsMapi.name] },
      { query: "fetch multiple items", expected: [allTools.bulkGetItemsVariantsMapi.name] },
      { query: "bulk retrieve variants", expected: [allTools.bulkGetItemsVariantsMapi.name] },
      // delete / remove
      { query: "delete item variant", expected: [allTools.deleteLanguageVariantMapi.name] },
      {
        query: "remove variant translation",
        expected: [allTools.deleteLanguageVariantMapi.name],
      },
      // Synonym: localize / i18n / multilingual
      { query: "localize content", expected: [allTools.createLanguageVariantMapi.name] },
      { query: "multilingual content variant", expected: [allTools.createLanguageVariantMapi.name] },
      // Synonym: batch / mass
      { query: "batch retrieve content", expected: [allTools.bulkGetItemsVariantsMapi.name] },
      { query: "mass get items variants", expected: [allTools.bulkGetItemsVariantsMapi.name] },
    ],
  },
  {
    name: "filtering and searching content",
    cases: [
      { query: "filter items keyword", expected: [allTools.filterVariantsMapi.name] },
      {
        query: "find content exact keyword",
        expected: [allTools.filterVariantsMapi.name],
      },
      { query: "search content semantic", expected: [allTools.searchVariantsMapi.name] },
      { query: "search content topic", expected: [allTools.searchVariantsMapi.name] },
      { query: "find content by meaning", expected: [allTools.searchVariantsMapi.name] },
      {
        query: "items by content type",
        expected: [allTools.listVariantsTypeMapi.name],
      },
      {
        query: "variants filtered by type",
        expected: [allTools.listVariantsTypeMapi.name],
      },
      {
        query: "items in collection",
        expected: [allTools.listVariantsCollectionMapi.name],
      },
      {
        query: "variants by collection",
        expected: [allTools.listVariantsCollectionMapi.name],
      },
      { query: "content in space", expected: [allTools.listVariantsSpaceMapi.name] },
      { query: "variants by space", expected: [allTools.listVariantsSpaceMapi.name] },
      {
        query: "items with inline components",
        expected: [allTools.listVariantsComponentsTypeMapi.name],
      },
      // Synonym: query / lookup
      { query: "query content items", expected: [allTools.filterVariantsMapi.name] },
      { query: "lookup items by keyword", expected: [allTools.filterVariantsMapi.name] },
    ],
  },
  {
    name: "workflow operations",
    cases: [
      // create / add / new
      { query: "create workflow", expected: [allTools.addWorkflowMapi.name] },
      { query: "add workflow", expected: [allTools.addWorkflowMapi.name] },
      { query: "new workflow steps", expected: [allTools.addWorkflowMapi.name] },
      // change / move / transition
      {
        query: "change workflow step",
        expected: [allTools.changeVariantWorkflowStepMapi.name],
      },
      {
        query: "move to review step",
        expected: [allTools.changeVariantWorkflowStepMapi.name],
      },
      {
        query: "transition workflow step",
        expected: [allTools.changeVariantWorkflowStepMapi.name],
      },
      // publish
      { query: "publish item variant", expected: [allTools.publishVariantMapi.name] },
      { query: "publish content", expected: [allTools.publishVariantMapi.name] },
      { query: "schedule publishing", expected: [allTools.publishVariantMapi.name] },
      // unpublish
      { query: "unpublish content", expected: [allTools.unpublishVariantMapi.name] },
      { query: "take content offline", expected: [allTools.unpublishVariantMapi.name] },
      // Synonym: approve / review / lifecycle / archive
      { query: "approve content review", expected: [allTools.changeVariantWorkflowStepMapi.name] },
      { query: "content lifecycle status", expected: [allTools.listWorkflowsMapi.name] },
      { query: "archive content", expected: [allTools.changeVariantWorkflowStepMapi.name] },
      // list / get
      { query: "list workflows", expected: [allTools.listWorkflowsMapi.name] },
      { query: "get workflows", expected: [allTools.listWorkflowsMapi.name] },
      { query: "workflow draft review", expected: [allTools.listWorkflowsMapi.name] },
      // update / edit / modify
      { query: "update workflow steps", expected: [allTools.updateWorkflowMapi.name] },
      { query: "edit workflow", expected: [allTools.updateWorkflowMapi.name] },
      { query: "modify workflow", expected: [allTools.updateWorkflowMapi.name] },
      // delete / remove
      { query: "delete workflow", expected: [allTools.deleteWorkflowMapi.name] },
      { query: "remove workflow", expected: [allTools.deleteWorkflowMapi.name] },
    ],
  },
  {
    name: "taxonomy operations",
    cases: [
      // create / add / new
      { query: "create taxonomy group", expected: [allTools.addTaxonomyGroupMapi.name] },
      { query: "add taxonomy group", expected: [allTools.addTaxonomyGroupMapi.name] },
      { query: "new taxonomy categories", expected: [allTools.addTaxonomyGroupMapi.name] },
      // get / retrieve
      {
        query: "get taxonomy group",
        expected: [allTools.getTaxonomyGroupMapi.name, allTools.listTaxonomyGroupsMapi.name],
      },
      { query: "retrieve taxonomy", expected: [allTools.getTaxonomyGroupMapi.name] },
      // Synonym: categories / tags
      {
        query: "taxonomy categories tags",
        expected: [allTools.addTaxonomyGroupMapi.name, allTools.getTaxonomyGroupMapi.name],
      },
      // modify / patch / edit
      { query: "modify taxonomy terms", expected: [allTools.patchTaxonomyGroupMapi.name] },
      { query: "patch taxonomy", expected: [allTools.patchTaxonomyGroupMapi.name] },
      { query: "edit taxonomy group", expected: [allTools.patchTaxonomyGroupMapi.name] },
      // list
      { query: "list taxonomy groups", expected: [allTools.listTaxonomyGroupsMapi.name] },
      // delete / remove
      { query: "delete taxonomy group", expected: [allTools.deleteTaxonomyGroupMapi.name] },
      { query: "remove taxonomy group", expected: [allTools.deleteTaxonomyGroupMapi.name] },
      // Synonym: hierarchy / classification / organize
      { query: "classification hierarchy", expected: [allTools.getTaxonomyGroupMapi.name] },
      { query: "content categorization", expected: [allTools.getTaxonomyGroupMapi.name] },
      { query: "organize content terms", expected: [allTools.patchTaxonomyGroupMapi.name] },
    ],
  },
  {
    name: "asset operations",
    cases: [
      // get / retrieve / fetch
      { query: "get asset", expected: [allTools.getAssetMapi.name] },
      { query: "retrieve asset by id", expected: [allTools.getAssetMapi.name] },
      { query: "fetch asset", expected: [allTools.getAssetMapi.name] },
      // list / all
      { query: "list assets", expected: [allTools.listAssetsMapi.name] },
      { query: "all assets", expected: [allTools.listAssetsMapi.name] },
      // update / edit / modify
      { query: "update asset metadata", expected: [allTools.updateAssetMapi.name] },
      { query: "edit asset title", expected: [allTools.updateAssetMapi.name] },
      { query: "modify asset", expected: [allTools.updateAssetMapi.name] },
      // Folders
      {
        query: "asset folders",
        expected: [allTools.listAssetFoldersMapi.name, allTools.patchAssetFoldersMapi.name],
      },
      { query: "list asset folders", expected: [allTools.listAssetFoldersMapi.name] },
      { query: "modify asset folders", expected: [allTools.patchAssetFoldersMapi.name] },
      { query: "edit asset folders", expected: [allTools.patchAssetFoldersMapi.name] },
      // Synonym: image / file / media / document
      { query: "get image file", expected: [allTools.getAssetMapi.name] },
      { query: "list media files", expected: [allTools.listAssetsMapi.name] },
      { query: "documents videos assets", expected: [allTools.listAssetsMapi.name] },
    ],
  },
  {
    name: "language operations",
    cases: [
      // create / add / new
      { query: "add language", expected: [allTools.addLanguageMapi.name] },
      { query: "create language", expected: [allTools.addLanguageMapi.name] },
      { query: "new language locale", expected: [allTools.addLanguageMapi.name] },
      // list / get
      { query: "list languages", expected: [allTools.listLanguagesMapi.name] },
      { query: "get languages", expected: [allTools.listLanguagesMapi.name] },
      { query: "available languages", expected: [allTools.listLanguagesMapi.name] },
      // modify / patch / edit
      { query: "modify language fallback", expected: [allTools.patchLanguageMapi.name] },
      { query: "patch language", expected: [allTools.patchLanguageMapi.name] },
      { query: "edit language", expected: [allTools.patchLanguageMapi.name] },
      // Synonym: localization / translations
      {
        query: "localization translations",
        expected: [allTools.addLanguageMapi.name, allTools.listLanguagesMapi.name],
      },
      // Synonym: locale / i18n / fallback
      { query: "configure locale", expected: [allTools.addLanguageMapi.name] },
      { query: "language fallback inheritance", expected: [allTools.patchLanguageMapi.name] },
    ],
  },
  {
    name: "space operations",
    cases: [
      // create / add / new
      { query: "create space", expected: [allTools.addSpaceMapi.name] },
      { query: "add space", expected: [allTools.addSpaceMapi.name] },
      { query: "new space website", expected: [allTools.addSpaceMapi.name] },
      // list / get
      { query: "list spaces", expected: [allTools.listSpacesMapi.name] },
      { query: "get spaces", expected: [allTools.listSpacesMapi.name] },
      // delete / remove
      { query: "delete space", expected: [allTools.deleteSpaceMapi.name] },
      { query: "remove space", expected: [allTools.deleteSpaceMapi.name] },
      // modify / patch / edit
      { query: "patch space", expected: [allTools.patchSpaceMapi.name] },
      { query: "update space", expected: [allTools.patchSpaceMapi.name] },
      // Synonym: channel / site / website
      { query: "website channel setup", expected: [allTools.addSpaceMapi.name] },
      { query: "site configuration", expected: [allTools.listSpacesMapi.name] },
    ],
  },
  {
    name: "collection operations",
    cases: [
      { query: "list collections", expected: [allTools.listCollectionsMapi.name] },
      { query: "get collections", expected: [allTools.listCollectionsMapi.name] },
      { query: "modify collections", expected: [allTools.patchCollectionsMapi.name] },
      { query: "patch collections", expected: [allTools.patchCollectionsMapi.name] },
      { query: "edit collections", expected: [allTools.patchCollectionsMapi.name] },
      // Synonym: group / organize / bucket
      { query: "content groups organize", expected: [allTools.listCollectionsMapi.name] },
    ],
  },
  {
    name: "role operations",
    cases: [
      { query: "list roles", expected: [allTools.listRolesMapi.name] },
      { query: "roles permissions", expected: [allTools.listRolesMapi.name] },
      { query: "get roles", expected: [allTools.listRolesMapi.name] },
      // Synonym: access / security / users
      { query: "user access permissions", expected: [allTools.listRolesMapi.name] },
      { query: "security roles", expected: [allTools.listRolesMapi.name] },
    ],
  },
  {
    name: "patch guide",
    cases: [
      { query: "patch operations guide", expected: [allTools.getPatchGuide.name] },
      { query: "patch guide", expected: [allTools.getPatchGuide.name] },
      { query: "patch reference guide", expected: [allTools.getPatchGuide.name] },
    ],
  },
  {
    name: "agent-style natural language queries",
    cases: [
      {
        query: "create blog post content type",
        expected: [allTools.addContentTypeMapi.name],
      },
      { query: "content models schemas", expected: [allTools.listContentTypesMapi.name] },
      { query: "add field to content type", expected: [allTools.patchContentTypeMapi.name] },
      { query: "publish language version", expected: [allTools.publishVariantMapi.name] },
      { query: "create taxonomy categories", expected: [allTools.addTaxonomyGroupMapi.name] },
      {
        query: "move to published workflow step",
        expected: [allTools.changeVariantWorkflowStepMapi.name],
      },
      { query: "images assets media", expected: [allTools.listAssetsMapi.name, allTools.getAssetMapi.name] },
      { query: "add translation language", expected: [allTools.createLanguageVariantMapi.name] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Generate tests from data
// ---------------------------------------------------------------------------

describe(`BM25 tool search — finds appropriate tools in top ${topK} results`, () => {
  let index: MiniSearch<ToolDocument>;

  before(() => {
    index = createToolSearchIndex(Object.values(allTools));
  });

  for (const group of testGroups) {
    describe(group.name, () => {
      for (const { query, expected } of group.cases) {
        it(`"${query}" → [${expected.join(", ")}]`, () => {
          assertToolsFound(index, query, expected);
        });
      }
    });
  }
});
