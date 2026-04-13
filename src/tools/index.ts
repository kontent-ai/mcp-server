import { bulkGetContentItemVariants } from "./bulk-get-content-item-variants.js";
import { changeContentItemVariantWorkflowStep } from "./change-content-item-variant-workflow-step.js";
import { createContentItem } from "./create-content-item.js";
import { createContentItemVariant } from "./create-content-item-variant.js";
import { createContentType } from "./create-content-type.js";
import { createContentTypeSnippet } from "./create-content-type-snippet.js";
import { createLanguage } from "./create-language.js";
import { createNewContentItemVariantVersion } from "./create-new-content-item-variant-version.js";
import { createSpace } from "./create-space.js";
import { createTaxonomyGroup } from "./create-taxonomy-group.js";
import { createWorkflow } from "./create-workflow.js";
import { deleteContentItem } from "./delete-content-item.js";
import { deleteContentItemVariant } from "./delete-content-item-variant.js";
import { deleteContentType } from "./delete-content-type.js";
import { deleteContentTypeSnippet } from "./delete-content-type-snippet.js";
import { deleteSpace } from "./delete-space.js";
import { deleteTaxonomyGroup } from "./delete-taxonomy-group.js";
import { deleteWorkflow } from "./delete-workflow.js";
import { getAsset } from "./get-asset.js";
import { getContentItem } from "./get-content-item.js";
import { getContentItemTranslations } from "./get-content-item-translations.js";
import { getContentItemVariant } from "./get-content-item-variant.js";
import { getContentType } from "./get-content-type.js";
import { getContentTypeSnippet } from "./get-content-type-snippet.js";
import { getPatchGuide } from "./get-patch-guide.js";
import { getPublishedContentItemVariantVersion } from "./get-published-content-item-variant-version.js";
import { getTaxonomyGroup } from "./get-taxonomy-group.js";
import { listAssetFolders } from "./list-asset-folders.js";
import { listAssets } from "./list-assets.js";
import { listCollections } from "./list-collections.js";
import { listContentItemVariants } from "./list-content-item-variants.js";
import { listContentTypeSnippets } from "./list-content-type-snippets.js";
import { listContentTypes } from "./list-content-types.js";
import { listLanguages } from "./list-languages.js";
import { listRoles } from "./list-roles.js";
import { listSpaces } from "./list-spaces.js";
import { listTaxonomyGroups } from "./list-taxonomy-groups.js";
import { listWorkflows } from "./list-workflows.js";
import { patchAssetFolders } from "./patch-asset-folders.js";
import { patchCollections } from "./patch-collections.js";
import { patchContentType } from "./patch-content-type.js";
import { patchContentTypeSnippet } from "./patch-content-type-snippet.js";
import { patchLanguage } from "./patch-language.js";
import { patchSpace } from "./patch-space.js";
import { patchTaxonomyGroup } from "./patch-taxonomy-group.js";
import { publishContentItemVariant } from "./publish-content-item-variant.js";
import { searchContentItemVariants } from "./search-content-item-variants.js";
import { unpublishContentItemVariant } from "./unpublish-content-item-variant.js";
import { updateAsset } from "./update-asset.js";
import { updateContentItem } from "./update-content-item.js";
import { updateContentItemVariant } from "./update-content-item-variant.js";
import { updateWorkflow } from "./update-workflow.js";

export const allTools = {
  createContentItem,
  createContentTypeSnippet,
  createContentType,
  createLanguage,
  createSpace,
  createTaxonomyGroup,
  createWorkflow,
  bulkGetContentItemVariants,
  changeContentItemVariantWorkflowStep,
  createContentItemVariant,
  createNewContentItemVariantVersion,
  deleteContentItem,
  deleteContentTypeSnippet,
  deleteContentType,
  deleteContentItemVariant,
  deleteSpace,
  deleteTaxonomyGroup,
  deleteWorkflow,
  getAsset,
  getContentItem,
  getContentTypeSnippet,
  getContentType,
  getContentItemTranslations,
  getContentItemVariant,
  getPatchGuide,
  getPublishedContentItemVariantVersion,
  getTaxonomyGroup,
  listAssetFolders,
  listAssets,
  listCollections,
  listContentTypeSnippets,
  listContentTypes,
  listContentItemVariants,
  listLanguages,
  listRoles,
  listSpaces,
  listTaxonomyGroups,
  listWorkflows,
  patchAssetFolders,
  patchCollections,
  patchContentTypeSnippet,
  patchContentType,
  patchLanguage,
  patchSpace,
  patchTaxonomyGroup,
  publishContentItemVariant,
  searchContentItemVariants,
  unpublishContentItemVariant,
  updateAsset,
  updateContentItem,
  updateContentItemVariant,
  updateWorkflow,
} as const;
