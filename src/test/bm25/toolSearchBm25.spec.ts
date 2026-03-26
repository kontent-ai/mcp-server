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
      {
        query: "create content type",
        expected: [allTools.addContentType.name],
      },
      {
        query: "add content type",
        expected: [allTools.addContentType.name],
      },
      {
        query: "new content type",
        expected: [allTools.addContentType.name],
      },
      // Synonym: model / schema / definition
      {
        query: "content model schema",
        expected: [allTools.addContentType.name],
      },
      // Action verb variations: get / retrieve / fetch
      {
        query: "get content type",
        expected: [allTools.getType.name, allTools.listContentTypes.name],
      },
      { query: "retrieve content type", expected: [allTools.getType.name] },
      { query: "fetch content type", expected: [allTools.getType.name] },
      // Action verb variations: delete / remove
      {
        query: "delete content type",
        expected: [allTools.deleteContentType.name],
      },
      {
        query: "remove content type",
        expected: [allTools.deleteContentType.name],
      },
      // Action verb variations: modify / patch / edit / update
      {
        query: "modify content type elements",
        expected: [allTools.patchContentType.name],
      },
      {
        query: "patch content type",
        expected: [allTools.patchContentType.name],
      },
      {
        query: "edit content type fields",
        expected: [allTools.patchContentType.name],
      },
      // Action verb variations: list / all / browse
      {
        query: "list content types",
        expected: [allTools.listContentTypes.name],
      },
      {
        query: "all content types",
        expected: [allTools.listContentTypes.name],
      },
      // Synonym: structure / definition / template
      {
        query: "content type structure",
        expected: [allTools.getType.name],
      },
      {
        query: "content type definition",
        expected: [allTools.getType.name],
      },
      {
        query: "content template fields",
        expected: [allTools.addContentType.name],
      },
    ],
  },
  {
    name: "content type snippet operations",
    cases: [
      {
        query: "content type snippet",
        expected: [
          allTools.addContentTypeSnippet.name,
          allTools.getTypeSnippet.name,
          allTools.listContentTypeSnippets.name,
        ],
      },
      {
        query: "reusable snippet elements",
        expected: [
          allTools.addContentTypeSnippet.name,
          allTools.getTypeSnippet.name,
        ],
      },
      {
        query: "create snippet",
        expected: [allTools.addContentTypeSnippet.name],
      },
      { query: "get snippet", expected: [allTools.getTypeSnippet.name] },
      {
        query: "modify snippet",
        expected: [allTools.patchTypeSnippet.name],
      },
      {
        query: "patch snippet",
        expected: [allTools.patchTypeSnippet.name],
      },
      {
        query: "delete snippet",
        expected: [allTools.deleteTypeSnippet.name],
      },
      {
        query: "remove snippet",
        expected: [allTools.deleteTypeSnippet.name],
      },
    ],
  },
  {
    name: "content item operations",
    cases: [
      // create / add / new
      {
        query: "create content item",
        expected: [allTools.addContentItem.name],
      },
      {
        query: "add content item",
        expected: [allTools.addContentItem.name],
      },
      {
        query: "new content item",
        expected: [allTools.addContentItem.name],
      },
      // get / retrieve
      { query: "get content item", expected: [allTools.getItem.name] },
      { query: "retrieve content item", expected: [allTools.getItem.name] },
      // update / edit
      {
        query: "update content item name",
        expected: [allTools.updateContentItem.name],
      },
      {
        query: "edit content item",
        expected: [allTools.updateContentItem.name],
      },
      // delete / remove
      {
        query: "delete content item",
        expected: [allTools.deleteContentItem.name],
      },
      {
        query: "remove content item",
        expected: [allTools.deleteContentItem.name],
      },
      // Synonym: page / entry / record
      {
        query: "create page entry",
        expected: [allTools.addContentItem.name],
      },
      { query: "get content entry", expected: [allTools.getItem.name] },
    ],
  },
  {
    name: "item variant / translation operations",
    cases: [
      // Translation-related
      {
        query: "translate content language",
        expected: [
          allTools.createLanguageVariant.name,
          allTools.listVariantsItem.name,
        ],
      },
      {
        query: "add translation",
        expected: [allTools.createLanguageVariant.name],
      },
      {
        query: "create language version",
        expected: [allTools.createLanguageVariant.name],
      },
      // create / add / new
      {
        query: "create item variant",
        expected: [allTools.createLanguageVariant.name],
      },
      {
        query: "add item variant",
        expected: [allTools.createLanguageVariant.name],
      },
      // get / retrieve / fetch (draft)
      {
        query: "get draft variant",
        expected: [allTools.getLatestVariant.name],
      },
      {
        query: "fetch latest variant",
        expected: [allTools.getLatestVariant.name],
      },
      {
        query: "retrieve draft content",
        expected: [allTools.getLatestVariant.name],
      },
      // get / retrieve / fetch (published)
      {
        query: "get published content",
        expected: [allTools.getPublishedVariant.name],
      },
      {
        query: "retrieve published variant",
        expected: [allTools.getPublishedVariant.name],
      },
      {
        query: "live published variant",
        expected: [allTools.getPublishedVariant.name],
      },
      // update / edit / write
      {
        query: "update item variant content",
        expected: [allTools.updateLanguageVariant.name],
      },
      {
        query: "edit variant elements",
        expected: [allTools.updateLanguageVariant.name],
      },
      {
        query: "write variant content",
        expected: [allTools.updateLanguageVariant.name],
      },
      // New version
      {
        query: "create new draft version",
        expected: [allTools.createVariantVersion.name],
      },
      {
        query: "new version published variant",
        expected: [allTools.createVariantVersion.name],
      },
      // Bulk
      {
        query: "bulk get item variants",
        expected: [allTools.bulkGetItemsVariants.name],
      },
      {
        query: "fetch multiple items",
        expected: [allTools.bulkGetItemsVariants.name],
      },
      {
        query: "bulk retrieve variants",
        expected: [allTools.bulkGetItemsVariants.name],
      },
      // delete / remove
      {
        query: "delete item variant",
        expected: [allTools.deleteLanguageVariant.name],
      },
      {
        query: "remove variant translation",
        expected: [allTools.deleteLanguageVariant.name],
      },
      // Synonym: localize / i18n / multilingual
      {
        query: "localize content",
        expected: [allTools.createLanguageVariant.name],
      },
      {
        query: "multilingual content variant",
        expected: [allTools.createLanguageVariant.name],
      },
      // Synonym: batch / mass
      {
        query: "batch retrieve content",
        expected: [allTools.bulkGetItemsVariants.name],
      },
      {
        query: "mass get items variants",
        expected: [allTools.bulkGetItemsVariants.name],
      },
    ],
  },
  {
    name: "filtering and searching content",
    cases: [
      {
        query: "filter items keyword",
        expected: [allTools.filterVariants.name],
      },
      {
        query: "find content exact keyword",
        expected: [allTools.filterVariants.name],
      },
      {
        query: "search content semantic",
        expected: [allTools.searchVariants.name],
      },
      {
        query: "search content topic",
        expected: [allTools.searchVariants.name],
      },
      {
        query: "find content by meaning",
        expected: [allTools.searchVariants.name],
      },
      {
        query: "items by content type",
        expected: [allTools.listVariantsType.name],
      },
      {
        query: "variants filtered by type",
        expected: [allTools.listVariantsType.name],
      },
      {
        query: "items in collection",
        expected: [allTools.listVariantsCollection.name],
      },
      {
        query: "variants by collection",
        expected: [allTools.listVariantsCollection.name],
      },
      {
        query: "content in space",
        expected: [allTools.listVariantsSpace.name],
      },
      {
        query: "variants by space",
        expected: [allTools.listVariantsSpace.name],
      },
      {
        query: "items with inline components",
        expected: [allTools.listVariantsComponentsType.name],
      },
      // Synonym: query / lookup
      {
        query: "query content items",
        expected: [allTools.filterVariants.name],
      },
      {
        query: "lookup items by keyword",
        expected: [allTools.filterVariants.name],
      },
    ],
  },
  {
    name: "workflow operations",
    cases: [
      // create / add / new
      { query: "create workflow", expected: [allTools.addWorkflow.name] },
      { query: "add workflow", expected: [allTools.addWorkflow.name] },
      {
        query: "new workflow steps",
        expected: [allTools.addWorkflow.name],
      },
      // change / move / transition
      {
        query: "change workflow step",
        expected: [allTools.changeVariantWorkflowStep.name],
      },
      {
        query: "move to review step",
        expected: [allTools.changeVariantWorkflowStep.name],
      },
      {
        query: "transition workflow step",
        expected: [allTools.changeVariantWorkflowStep.name],
      },
      // publish
      {
        query: "publish item variant",
        expected: [allTools.publishVariant.name],
      },
      {
        query: "publish content",
        expected: [allTools.publishVariant.name],
      },
      {
        query: "schedule publishing",
        expected: [allTools.publishVariant.name],
      },
      // unpublish
      {
        query: "unpublish content",
        expected: [allTools.unpublishVariant.name],
      },
      {
        query: "take content offline",
        expected: [allTools.unpublishVariant.name],
      },
      // Synonym: approve / review / lifecycle / archive
      {
        query: "approve content review",
        expected: [allTools.changeVariantWorkflowStep.name],
      },
      {
        query: "content lifecycle status",
        expected: [allTools.listWorkflows.name],
      },
      {
        query: "archive content",
        expected: [allTools.changeVariantWorkflowStep.name],
      },
      // list / get
      { query: "list workflows", expected: [allTools.listWorkflows.name] },
      { query: "get workflows", expected: [allTools.listWorkflows.name] },
      {
        query: "workflow draft review",
        expected: [allTools.listWorkflows.name],
      },
      // update / edit / modify
      {
        query: "update workflow steps",
        expected: [allTools.updateWorkflow.name],
      },
      { query: "edit workflow", expected: [allTools.updateWorkflow.name] },
      {
        query: "modify workflow",
        expected: [allTools.updateWorkflow.name],
      },
      // delete / remove
      {
        query: "delete workflow",
        expected: [allTools.deleteWorkflow.name],
      },
      {
        query: "remove workflow",
        expected: [allTools.deleteWorkflow.name],
      },
    ],
  },
  {
    name: "taxonomy operations",
    cases: [
      // create / add / new
      {
        query: "create taxonomy group",
        expected: [allTools.addTaxonomyGroup.name],
      },
      {
        query: "add taxonomy group",
        expected: [allTools.addTaxonomyGroup.name],
      },
      {
        query: "new taxonomy categories",
        expected: [allTools.addTaxonomyGroup.name],
      },
      // get / retrieve
      {
        query: "get taxonomy group",
        expected: [
          allTools.getTaxonomyGroup.name,
          allTools.listTaxonomyGroups.name,
        ],
      },
      {
        query: "retrieve taxonomy",
        expected: [allTools.getTaxonomyGroup.name],
      },
      // Synonym: categories / tags
      {
        query: "taxonomy categories tags",
        expected: [
          allTools.addTaxonomyGroup.name,
          allTools.getTaxonomyGroup.name,
        ],
      },
      // modify / patch / edit
      {
        query: "modify taxonomy terms",
        expected: [allTools.patchTaxonomyGroup.name],
      },
      {
        query: "patch taxonomy",
        expected: [allTools.patchTaxonomyGroup.name],
      },
      {
        query: "edit taxonomy group",
        expected: [allTools.patchTaxonomyGroup.name],
      },
      // list
      {
        query: "list taxonomy groups",
        expected: [allTools.listTaxonomyGroups.name],
      },
      // delete / remove
      {
        query: "delete taxonomy group",
        expected: [allTools.deleteTaxonomyGroup.name],
      },
      {
        query: "remove taxonomy group",
        expected: [allTools.deleteTaxonomyGroup.name],
      },
      // Synonym: hierarchy / classification / organize
      {
        query: "classification hierarchy",
        expected: [allTools.getTaxonomyGroup.name],
      },
      {
        query: "content categorization",
        expected: [allTools.getTaxonomyGroup.name],
      },
      {
        query: "organize content terms",
        expected: [allTools.patchTaxonomyGroup.name],
      },
    ],
  },
  {
    name: "asset operations",
    cases: [
      // get / retrieve / fetch
      { query: "get asset", expected: [allTools.getAsset.name] },
      { query: "retrieve asset by id", expected: [allTools.getAsset.name] },
      { query: "fetch asset", expected: [allTools.getAsset.name] },
      // list / all
      { query: "list assets", expected: [allTools.listAssets.name] },
      { query: "all assets", expected: [allTools.listAssets.name] },
      // update / edit / modify
      {
        query: "update asset metadata",
        expected: [allTools.updateAsset.name],
      },
      { query: "edit asset title", expected: [allTools.updateAsset.name] },
      { query: "modify asset", expected: [allTools.updateAsset.name] },
      // Folders
      {
        query: "asset folders",
        expected: [
          allTools.listAssetFolders.name,
          allTools.patchAssetFolders.name,
        ],
      },
      {
        query: "list asset folders",
        expected: [allTools.listAssetFolders.name],
      },
      {
        query: "modify asset folders",
        expected: [allTools.patchAssetFolders.name],
      },
      {
        query: "edit asset folders",
        expected: [allTools.patchAssetFolders.name],
      },
      // Synonym: image / file / media / document
      { query: "get image file", expected: [allTools.getAsset.name] },
      { query: "list media files", expected: [allTools.listAssets.name] },
      {
        query: "documents videos assets",
        expected: [allTools.listAssets.name],
      },
    ],
  },
  {
    name: "language operations",
    cases: [
      // create / add / new
      { query: "add language", expected: [allTools.addLanguage.name] },
      { query: "create language", expected: [allTools.addLanguage.name] },
      {
        query: "new language locale",
        expected: [allTools.addLanguage.name],
      },
      // list / get
      { query: "list languages", expected: [allTools.listLanguages.name] },
      { query: "get languages", expected: [allTools.listLanguages.name] },
      {
        query: "available languages",
        expected: [allTools.listLanguages.name],
      },
      // modify / patch / edit
      {
        query: "modify language fallback",
        expected: [allTools.patchLanguage.name],
      },
      { query: "patch language", expected: [allTools.patchLanguage.name] },
      { query: "edit language", expected: [allTools.patchLanguage.name] },
      // Synonym: localization / translations
      {
        query: "localization translations",
        expected: [allTools.addLanguage.name, allTools.listLanguages.name],
      },
      // Synonym: locale / i18n / fallback
      { query: "configure locale", expected: [allTools.addLanguage.name] },
      {
        query: "language fallback inheritance",
        expected: [allTools.patchLanguage.name],
      },
    ],
  },
  {
    name: "space operations",
    cases: [
      // create / add / new
      { query: "create space", expected: [allTools.addSpace.name] },
      { query: "add space", expected: [allTools.addSpace.name] },
      { query: "new space website", expected: [allTools.addSpace.name] },
      // list / get
      { query: "list spaces", expected: [allTools.listSpaces.name] },
      { query: "get spaces", expected: [allTools.listSpaces.name] },
      // delete / remove
      { query: "delete space", expected: [allTools.deleteSpace.name] },
      { query: "remove space", expected: [allTools.deleteSpace.name] },
      // modify / patch / edit
      { query: "patch space", expected: [allTools.patchSpace.name] },
      { query: "update space", expected: [allTools.patchSpace.name] },
      // Synonym: channel / site / website
      {
        query: "website channel setup",
        expected: [allTools.addSpace.name],
      },
      { query: "site configuration", expected: [allTools.listSpaces.name] },
    ],
  },
  {
    name: "collection operations",
    cases: [
      {
        query: "list collections",
        expected: [allTools.listCollections.name],
      },
      {
        query: "get collections",
        expected: [allTools.listCollections.name],
      },
      {
        query: "modify collections",
        expected: [allTools.patchCollections.name],
      },
      {
        query: "patch collections",
        expected: [allTools.patchCollections.name],
      },
      {
        query: "edit collections",
        expected: [allTools.patchCollections.name],
      },
      // Synonym: group / organize / bucket
      {
        query: "content groups organize",
        expected: [allTools.listCollections.name],
      },
    ],
  },
  {
    name: "role operations",
    cases: [
      { query: "list roles", expected: [allTools.listRoles.name] },
      { query: "roles permissions", expected: [allTools.listRoles.name] },
      { query: "get roles", expected: [allTools.listRoles.name] },
      // Synonym: access / security / users
      {
        query: "user access permissions",
        expected: [allTools.listRoles.name],
      },
      { query: "security roles", expected: [allTools.listRoles.name] },
    ],
  },
  {
    name: "patch guide",
    cases: [
      {
        query: "patch operations guide",
        expected: [allTools.getPatchGuide.name],
      },
      { query: "patch guide", expected: [allTools.getPatchGuide.name] },
      {
        query: "patch reference guide",
        expected: [allTools.getPatchGuide.name],
      },
    ],
  },
  {
    name: "agent-style natural language queries",
    cases: [
      {
        query: "create blog post content type",
        expected: [allTools.addContentType.name],
      },
      {
        query: "content models schemas",
        expected: [allTools.listContentTypes.name],
      },
      {
        query: "add field to content type",
        expected: [allTools.patchContentType.name],
      },
      {
        query: "publish language version",
        expected: [allTools.publishVariant.name],
      },
      {
        query: "create taxonomy categories",
        expected: [allTools.addTaxonomyGroup.name],
      },
      {
        query: "move to published workflow step",
        expected: [allTools.changeVariantWorkflowStep.name],
      },
      {
        query: "images assets media",
        expected: [allTools.listAssets.name, allTools.getAsset.name],
      },
      {
        query: "add translation language",
        expected: [allTools.createLanguageVariant.name],
      },
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
