import type { ManagementClient } from "@kontent-ai/management-sdk";
import { z } from "zod";
import { resolveCredentials } from "../clients/credentials.js";
import { createMapiClient } from "../clients/kontentClients.js";
import { listContentTypeUsagesSchema } from "../schemas/listSchemas.js";
import { handleMcpToolError } from "../utils/errorHandler.js";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { throwError } from "../utils/throwError.js";
import { defineReadOnlyTool } from "./toolDefinition.js";

// Sources are walked in this order, each exhausted before the next one starts.
const usedInLocations = ["item", "content_component_in_variant"] as const;
type UsedIn = (typeof usedInLocations)[number];

// The MAPI sources are paged independently, so the tool's own continuation
// token records which source the agent is currently walking plus that source's
// MAPI continuation token.
type UsageCursor = {
  readonly usedIn: UsedIn;
  readonly continuationToken: string | null;
};

type UsageQueryContext = {
  readonly client: ManagementClient;
  readonly environmentId: string;
  readonly contentTypeId: string;
};

type ItemReference = {
  readonly item: { readonly id: string };
};

type ItemVariantReference = ItemReference & {
  readonly language: { readonly id: string };
};

type Usage =
  | ({ used_in: "item" } & ItemReference)
  | ({ used_in: "content_component_in_variant" } & ItemVariantReference);

type UsagePage = {
  readonly usages: Usage[];
  readonly continuationToken: string | null;
};

// Same source while it still has pages, otherwise the start of the following
// source, otherwise done.
const getNextCursor = (
  cursor: UsageCursor,
  continuationToken: string | null,
): UsageCursor | null => {
  if (continuationToken) {
    return { usedIn: cursor.usedIn, continuationToken };
  }
  const nextUsedIn: UsedIn | undefined =
    usedInLocations[usedInLocations.indexOf(cursor.usedIn) + 1];
  return nextUsedIn ? { usedIn: nextUsedIn, continuationToken: null } : null;
};

// Encoded as "<usedIn>:<MAPI continuation token>" — the MAPI token is base64,
// so the first colon is an unambiguous separator. Kept as short as possible:
// the agent has to reproduce the token verbatim.
const encodeCursor = (cursor: UsageCursor): string =>
  `${cursor.usedIn}:${cursor.continuationToken ?? ""}`;

const decodeCursor = (encoded: string): UsageCursor => {
  const separator = encoded.indexOf(":");
  const usedIn = z.enum(usedInLocations).safeParse(encoded.slice(0, separator));
  return separator > 0 && usedIn.success
    ? {
        usedIn: usedIn.data,
        continuationToken: encoded.slice(separator + 1) || null,
      }
    : throwError(
        "Invalid continuation_token. Pass the value returned by the previous call unchanged.",
      );
};

const itemsPageSize = 100;

type ItemListResponse = {
  data: ReadonlyArray<{ id: { item_id: string } }>;
  pagination: { continuation_token: string | null };
};

const fetchItemUsages = async (
  { client, environmentId, contentTypeId }: UsageQueryContext,
  continuationToken: string | null,
): Promise<UsagePage> => {
  const query = client
    .post()
    .withAction(`projects/${environmentId}/early-access/items/list`)
    .withData({
      filters: { content_types: [{ id: contentTypeId }] },
      page_size: itemsPageSize,
    });
  const response = await (continuationToken
    ? query.withHeader({ header: "x-continuation", value: continuationToken })
    : query
  ).toPromise();
  const body: ItemListResponse = response.data;
  return {
    usages: body.data.map((result) => ({
      used_in: "item",
      item: { id: result.id.item_id },
    })),
    continuationToken: body.pagination.continuation_token,
  };
};

const fetchComponentUsages = async (
  { client, contentTypeId }: UsageQueryContext,
  continuationToken: string | null,
): Promise<UsagePage> => {
  const query = client
    .listLanguageVariantsOfContentTypeWithComponents()
    .byTypeId(contentTypeId);
  const response = await (continuationToken
    ? query.xContinuationToken(continuationToken)
    : query
  ).toPromise();
  const variants = response.rawData
    .variants as ReadonlyArray<ItemVariantReference>;
  return {
    usages: variants.map((variant) => ({
      used_in: "content_component_in_variant",
      item: { id: variant.item.id },
      language: { id: variant.language.id },
    })),
    continuationToken: response.data.pagination.continuationToken,
  };
};

const usageFetchers: Record<
  UsedIn,
  (
    context: UsageQueryContext,
    continuationToken: string | null,
  ) => Promise<UsagePage>
> = {
  item: fetchItemUsages,
  content_component_in_variant: fetchComponentUsages,
};

// Skips over sources that have nothing, so an empty page always means "no more
// pages" — an agent reads an empty list as "not used" and stops paging.
const fetchNextNonEmptyPage = async (
  context: UsageQueryContext,
  cursor: UsageCursor,
): Promise<{ usages: Usage[]; nextCursor: UsageCursor | null }> => {
  const page = await usageFetchers[cursor.usedIn](
    context,
    cursor.continuationToken,
  );
  const nextCursor = getNextCursor(cursor, page.continuationToken);
  return page.usages.length === 0 && nextCursor
    ? fetchNextNonEmptyPage(context, nextCursor)
    : { usages: page.usages, nextCursor };
};

export const listContentTypeUsages = defineReadOnlyTool(
  "list-content-type-usages",
  "List where a Kontent.ai content type is used — a usage report to check dependencies and impact before changing or deleting a content type. Returns lightweight references to the entities using the type, tagged with the kind of usage, for further lookup. Results come grouped by kind, one kind exhausted before the next begins.",
  listContentTypeUsagesSchema.shape,
  async (
    { contentTypeId, continuation_token },
    { authInfo: { token, clientId } = {} },
  ) => {
    const { environmentId, apiKey } = resolveCredentials(clientId, token);
    const client = createMapiClient(environmentId, apiKey);

    try {
      const cursor: UsageCursor = continuation_token
        ? decodeCursor(continuation_token)
        : { usedIn: usedInLocations[0], continuationToken: null };

      const { usages, nextCursor } = await fetchNextNonEmptyPage(
        { client, environmentId, contentTypeId },
        cursor,
      );

      return createMcpToolSuccessResponse({
        usages,
        pagination: {
          continuation_token: nextCursor ? encodeCursor(nextCursor) : null,
        },
      });
    } catch (error: unknown) {
      return handleMcpToolError(error, "Content Type Usages Listing");
    }
  },
);
