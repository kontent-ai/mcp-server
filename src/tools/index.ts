import { addContentItem } from "./add-content-item.js";
import { addContentType } from "./add-content-type.js";
import { addContentTypeSnippet } from "./add-content-type-snippet.js";
import { addLanguage } from "./add-language.js";
import { addSpace } from "./add-space.js";
import { addTaxonomyGroup } from "./add-taxonomy-group.js";
import { addWorkflow } from "./add-workflow.js";
import { bulkGetItemVariants } from "./bulk-get-item-variants.js";
import { changeItemVariantWorkflowStep } from "./change-item-variant-workflow-step.js";
import { createItemVariant } from "./create-item-variant.js";
import { createNewItemVariantVersion } from "./create-new-item-variant-version.js";
import { deleteContentItem } from "./delete-content-item.js";
import { deleteContentType } from "./delete-content-type.js";
import { deleteContentTypeSnippet } from "./delete-content-type-snippet.js";
import { deleteItemVariant } from "./delete-item-variant.js";
import { deleteSpace } from "./delete-space.js";
import { deleteTaxonomyGroup } from "./delete-taxonomy-group.js";
import { deleteWorkflow } from "./delete-workflow.js";
import { filterItemVariants } from "./filter-item-variants.js";
import { getAsset } from "./get-asset.js";
import { getContentItem } from "./get-content-item.js";
import { getContentType } from "./get-content-type.js";
import { getContentTypeSnippet } from "./get-content-type-snippet.js";
import { getItemVariants } from "./get-item-variants.js";
import { getLatestItemVariant } from "./get-latest-item-variant.js";
import { getPatchGuide } from "./get-patch-guide.js";
import { getPublishedItemVariant } from "./get-published-item-variant.js";
import { getTaxonomyGroup } from "./get-taxonomy-group.js";
import { listAssetFolders } from "./list-asset-folders.js";
import { listAssets } from "./list-assets.js";
import { listCollections } from "./list-collections.js";
import { listContentTypeSnippets } from "./list-content-type-snippets.js";
import { listContentTypes } from "./list-content-types.js";
import { listItemVariantsByCollection } from "./list-item-variants-by-collection.js";
import { listItemVariantsByComponentType } from "./list-item-variants-by-component-type.js";
import { listItemVariantsByContentType } from "./list-item-variants-by-content-type.js";
import { listItemVariantsBySpace } from "./list-item-variants-by-space.js";
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
import { publishItemVariant } from "./publish-item-variant.js";
import { searchItemVariants } from "./search-item-variants.js";
import { unpublishItemVariant } from "./unpublish-item-variant.js";
import { updateAsset } from "./update-asset.js";
import { updateContentItem } from "./update-content-item.js";
import { updateItemVariant } from "./update-item-variant.js";
import { updateWorkflow } from "./update-workflow.js";

export const allTools = {
  addContentItem,
  addContentTypeSnippet,
  addContentType,
  addLanguage,
  addSpace,
  addTaxonomyGroup,
  addWorkflow,
  bulkGetItemVariants,
  changeItemVariantWorkflowStep,
  createItemVariant,
  createNewItemVariantVersion,
  deleteContentItem,
  deleteContentTypeSnippet,
  deleteContentType,
  deleteItemVariant,
  deleteSpace,
  deleteTaxonomyGroup,
  deleteWorkflow,
  filterItemVariants,
  getAsset,
  getContentItem,
  getContentTypeSnippet,
  getContentType,
  getItemVariants,
  getLatestItemVariant,
  getPatchGuide,
  getPublishedItemVariant,
  getTaxonomyGroup,
  listAssetFolders,
  listAssets,
  listCollections,
  listContentTypeSnippets,
  listContentTypes,
  listItemVariantsByCollection,
  listItemVariantsByComponentType,
  listItemVariantsByContentType,
  listItemVariantsBySpace,
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
  publishItemVariant,
  searchItemVariants,
  unpublishItemVariant,
  updateAsset,
  updateContentItem,
  updateItemVariant,
  updateWorkflow,
} as const;
