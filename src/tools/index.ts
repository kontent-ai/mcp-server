import { addContentItem } from "./add-content-item.js";
import { addContentType } from "./add-content-type.js";
import { addContentTypeSnippet } from "./add-content-type-snippet.js";
import { addLanguage } from "./add-language.js";
import { addSpace } from "./add-space.js";
import { addTaxonomyGroup } from "./add-taxonomy-group.js";
import { addWorkflow } from "./add-workflow.js";
import { bulkGetItemsVariants } from "./bulk-get-items-variants.js";
import { changeVariantWorkflowStep } from "./change-variant-workflow-step.js";
import { createLanguageVariant } from "./create-language-variant.js";
import { createVariantVersion } from "./create-variant-version.js";
import { deleteContentItem } from "./delete-content-item.js";
import { deleteContentType } from "./delete-content-type.js";
import { deleteLanguageVariant } from "./delete-language-variant.js";
import { deleteSpace } from "./delete-space.js";
import { deleteTaxonomyGroup } from "./delete-taxonomy-group.js";
import { deleteTypeSnippet } from "./delete-type-snippet.js";
import { deleteWorkflow } from "./delete-workflow.js";
import { filterVariants } from "./filter-variants.js";
import { getAsset } from "./get-asset.js";
import { getItem } from "./get-item.js";
import { getLatestVariant } from "./get-latest-variant.js";
import { getPatchGuide } from "./get-patch-guide.js";
import { getPublishedVariant } from "./get-published-variant.js";
import { getTaxonomyGroup } from "./get-taxonomy-group.js";
import { getType } from "./get-type.js";
import { getTypeSnippet } from "./get-type-snippet.js";
import { listAssetFolders } from "./list-asset-folders.js";
import { listAssets } from "./list-assets.js";
import { listCollections } from "./list-collections.js";
import { listContentTypeSnippets } from "./list-content-type-snippets.js";
import { listContentTypes } from "./list-content-types.js";
import { listLanguages } from "./list-languages.js";
import { listRoles } from "./list-roles.js";
import { listSpaces } from "./list-spaces.js";
import { listTaxonomyGroups } from "./list-taxonomy-groups.js";
import { listVariantsCollection } from "./list-variants-collection.js";
import { listVariantsComponentsType } from "./list-variants-components-type.js";
import { listVariantsItem } from "./list-variants-item.js";
import { listVariantsSpace } from "./list-variants-space.js";
import { listVariantsType } from "./list-variants-type.js";
import { listWorkflows } from "./list-workflows.js";
import { patchAssetFolders } from "./patch-asset-folders.js";
import { patchCollections } from "./patch-collections.js";
import { patchContentType } from "./patch-content-type.js";
import { patchLanguage } from "./patch-language.js";
import { patchSpace } from "./patch-space.js";
import { patchTaxonomyGroup } from "./patch-taxonomy-group.js";
import { patchTypeSnippet } from "./patch-type-snippet.js";
import { publishVariant } from "./publish-variant.js";
import { searchVariants } from "./search-variants.js";
import { unpublishVariant } from "./unpublish-variant.js";
import { updateAsset } from "./update-asset.js";
import { updateContentItem } from "./update-content-item.js";
import { updateLanguageVariant } from "./update-language-variant.js";
import { updateWorkflow } from "./update-workflow.js";

export const allTools = {
  addContentItem,
  addContentType,
  addContentTypeSnippet,
  addLanguage,
  addSpace,
  addTaxonomyGroup,
  addWorkflow,
  bulkGetItemsVariants,
  changeVariantWorkflowStep,
  createLanguageVariant,
  createVariantVersion,
  deleteContentItem,
  deleteContentType,
  deleteLanguageVariant,
  deleteSpace,
  deleteTaxonomyGroup,
  deleteTypeSnippet,
  deleteWorkflow,
  filterVariants,
  getAsset,
  getItem,
  getLatestVariant,
  getPatchGuide,
  getPublishedVariant,
  getTaxonomyGroup,
  getType,
  getTypeSnippet,
  listAssetFolders,
  listAssets,
  listCollections,
  listContentTypeSnippets,
  listContentTypes,
  listLanguages,
  listRoles,
  listSpaces,
  listTaxonomyGroups,
  listVariantsCollection,
  listVariantsComponentsType,
  listVariantsItem,
  listVariantsSpace,
  listVariantsType,
  listWorkflows,
  patchAssetFolders,
  patchCollections,
  patchContentType,
  patchLanguage,
  patchSpace,
  patchTaxonomyGroup,
  patchTypeSnippet,
  publishVariant,
  searchVariants,
  unpublishVariant,
  updateAsset,
  updateContentItem,
  updateLanguageVariant,
  updateWorkflow,
} as const;
