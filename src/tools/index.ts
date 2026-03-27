import { addContentItemMapi } from "./add-content-item-mapi.js";
import { addContentTypeMapi } from "./add-content-type-mapi.js";
import { addContentTypeSnippetMapi } from "./add-content-type-snippet-mapi.js";
import { addLanguageMapi } from "./add-language-mapi.js";
import { addSpaceMapi } from "./add-space-mapi.js";
import { addTaxonomyGroupMapi } from "./add-taxonomy-group-mapi.js";
import { addWorkflowMapi } from "./add-workflow-mapi.js";
import { bulkGetItemsVariantsMapi } from "./bulk-get-items-variants-mapi.js";
import { changeVariantWorkflowStepMapi } from "./change-variant-workflow-step-mapi.js";
import { createLanguageVariantMapi } from "./create-language-variant-mapi.js";
import { createVariantVersionMapi } from "./create-variant-version-mapi.js";
import { deleteContentItemMapi } from "./delete-content-item-mapi.js";
import { deleteContentTypeMapi } from "./delete-content-type-mapi.js";
import { deleteLanguageVariantMapi } from "./delete-language-variant-mapi.js";
import { deleteSpaceMapi } from "./delete-space-mapi.js";
import { deleteTaxonomyGroupMapi } from "./delete-taxonomy-group-mapi.js";
import { deleteTypeSnippetMapi } from "./delete-type-snippet-mapi.js";
import { deleteWorkflowMapi } from "./delete-workflow-mapi.js";
import { filterVariantsMapi } from "./filter-variants-mapi.js";
import { getAssetMapi } from "./get-asset-mapi.js";
import { getItemMapi } from "./get-item-mapi.js";
import { getLatestVariantMapi } from "./get-latest-variant-mapi.js";
import { getPatchGuide } from "./get-patch-guide.js";
import { getPublishedVariantMapi } from "./get-published-variant-mapi.js";
import { getTaxonomyGroupMapi } from "./get-taxonomy-group-mapi.js";
import { getTypeMapi } from "./get-type-mapi.js";
import { getTypeSnippetMapi } from "./get-type-snippet-mapi.js";
import { listAssetFoldersMapi } from "./list-asset-folders-mapi.js";
import { listAssetsMapi } from "./list-assets-mapi.js";
import { listCollectionsMapi } from "./list-collections-mapi.js";
import { listContentTypeSnippetsMapi } from "./list-content-type-snippets-mapi.js";
import { listContentTypesMapi } from "./list-content-types-mapi.js";
import { listLanguagesMapi } from "./list-languages-mapi.js";
import { listRolesMapi } from "./list-roles-mapi.js";
import { listSpacesMapi } from "./list-spaces-mapi.js";
import { listTaxonomyGroupsMapi } from "./list-taxonomy-groups-mapi.js";
import { listVariantsCollectionMapi } from "./list-variants-collection-mapi.js";
import { listVariantsComponentsTypeMapi } from "./list-variants-components-type-mapi.js";
import { listVariantsItemMapi } from "./list-variants-item-mapi.js";
import { listVariantsSpaceMapi } from "./list-variants-space-mapi.js";
import { listVariantsTypeMapi } from "./list-variants-type-mapi.js";
import { listWorkflowsMapi } from "./list-workflows-mapi.js";
import { patchAssetFoldersMapi } from "./patch-asset-folders-mapi.js";
import { patchCollectionsMapi } from "./patch-collections-mapi.js";
import { patchContentTypeMapi } from "./patch-content-type-mapi.js";
import { patchLanguageMapi } from "./patch-language-mapi.js";
import { patchSpaceMapi } from "./patch-space-mapi.js";
import { patchTaxonomyGroupMapi } from "./patch-taxonomy-group-mapi.js";
import { patchTypeSnippetMapi } from "./patch-type-snippet-mapi.js";
import { publishVariantMapi } from "./publish-variant-mapi.js";
import { searchVariantsMapi } from "./search-variants-mapi.js";
import { unpublishVariantMapi } from "./unpublish-variant-mapi.js";
import { updateAssetMapi } from "./update-asset-mapi.js";
import { updateContentItemMapi } from "./update-content-item-mapi.js";
import { updateLanguageVariantMapi } from "./update-language-variant-mapi.js";
import { updateWorkflowMapi } from "./update-workflow-mapi.js";

export const allTools = {
  addContentItemMapi,
  addContentTypeMapi,
  addContentTypeSnippetMapi,
  addLanguageMapi,
  addSpaceMapi,
  addTaxonomyGroupMapi,
  addWorkflowMapi,
  bulkGetItemsVariantsMapi,
  changeVariantWorkflowStepMapi,
  createLanguageVariantMapi,
  createVariantVersionMapi,
  deleteContentItemMapi,
  deleteContentTypeMapi,
  deleteLanguageVariantMapi,
  deleteSpaceMapi,
  deleteTaxonomyGroupMapi,
  deleteTypeSnippetMapi,
  deleteWorkflowMapi,
  filterVariantsMapi,
  getAssetMapi,
  getItemMapi,
  getLatestVariantMapi,
  getPatchGuide,
  getPublishedVariantMapi,
  getTaxonomyGroupMapi,
  getTypeMapi,
  getTypeSnippetMapi,
  listAssetFoldersMapi,
  listAssetsMapi,
  listCollectionsMapi,
  listContentTypeSnippetsMapi,
  listContentTypesMapi,
  listLanguagesMapi,
  listRolesMapi,
  listSpacesMapi,
  listTaxonomyGroupsMapi,
  listVariantsCollectionMapi,
  listVariantsComponentsTypeMapi,
  listVariantsItemMapi,
  listVariantsSpaceMapi,
  listVariantsTypeMapi,
  listWorkflowsMapi,
  patchAssetFoldersMapi,
  patchCollectionsMapi,
  patchContentTypeMapi,
  patchLanguageMapi,
  patchSpaceMapi,
  patchTaxonomyGroupMapi,
  patchTypeSnippetMapi,
  publishVariantMapi,
  searchVariantsMapi,
  unpublishVariantMapi,
  updateAssetMapi,
  updateContentItemMapi,
  updateLanguageVariantMapi,
  updateWorkflowMapi,
} as const;
