import * as assert from "node:assert";
import { describe, it } from "mocha";
import { bulkGetContentItemVariants } from "../../tools/bulk-get-content-item-variants.js";
import { getContentItemTranslations } from "../../tools/get-content-item-translations.js";
import { getContentItemVariant } from "../../tools/get-content-item-variant.js";
import { getPublishedContentItemVariantVersion } from "../../tools/get-published-content-item-variant-version.js";

// The Management API returns 'agent_metadata.editability' for this tool (EN-786;
// the request opts in via the X-KC-Agent-Metadata header sent by the SDK's
// withAgentMetadata()), so the description has to point the agent at it.
// The guidance itself names the operation to perform, and it travels in the
// response body rather than the description — which is why the description does
// not name the tools that carry those operations out. Doing so would duplicate
// their name tokens into this tool's search document; see src/test/bm25/CLAUDE.md
// ("Two description anti-patterns...").
describe("get-content-item-variant description (EN-786)", () => {
  it("documents the agent metadata editability contract", () => {
    assert.match(
      getContentItemVariant.description,
      /agent_metadata\.editability/,
    );
    assert.match(getContentItemVariant.description, /is_editable/);
    assert.match(getContentItemVariant.description, /guidance/);
  });
});

// The list, bulk-get and published-version tools request the same metadata from
// the Management API; their descriptions must point the agent at it too.
describe("variant tools returning agent metadata (EN-786)", () => {
  const toolsWithAgentMetadata = [
    getContentItemTranslations,
    bulkGetContentItemVariants,
    getPublishedContentItemVariantVersion,
  ];

  it("document the agent metadata editability guidance", () => {
    for (const tool of toolsWithAgentMetadata) {
      assert.match(
        tool.description,
        /agent_metadata/,
        `Expected ${tool.name} description to mention agent_metadata`,
      );
      assert.match(
        tool.description,
        /guidance/,
        `Expected ${tool.name} description to mention guidance`,
      );
    }
  });
});
