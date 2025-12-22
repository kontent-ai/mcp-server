import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createMcpToolSuccessResponse } from "../utils/responseHelper.js";
import { pathBasedPatchGuide } from "./context/patch-guide-path-based.js";
import { propertyBasedPatchGuide } from "./context/patch-guide-property-based.js";
import { referenceBasedPatchGuide } from "./context/patch-guide-reference-based.js";

const entityTypeSchema = z.enum([
  "content-type",
  "snippet",
  "taxonomy",
  "collection",
  "asset-folder",
  "space",
  "language",
]);

type EntityType = z.infer<typeof entityTypeSchema>;

const getGuideForEntity = (entityType: EntityType): string => {
  switch (entityType) {
    case "content-type":
    case "snippet":
      return pathBasedPatchGuide;
    case "taxonomy":
    case "collection":
    case "asset-folder":
      return referenceBasedPatchGuide;
    case "space":
    case "language":
      return propertyBasedPatchGuide;
  }
};

export const registerTool = (server: McpServer): void => {
  server.tool(
    "get-patch-guide",
    "REQUIRED before any patch operation. Get patch operations guide for Kontent.ai Management API.",
    {
      entityType: entityTypeSchema.describe(
        "Entity type to get patch guide for: content-type, snippet, taxonomy, collection, asset-folder, space, language",
      ),
    },
    async ({ entityType }) => {
      try {
        return createMcpToolSuccessResponse(getGuideForEntity(entityType));
      } catch (error) {
        throw new Error(
          `Failed to read patch guide: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
};
