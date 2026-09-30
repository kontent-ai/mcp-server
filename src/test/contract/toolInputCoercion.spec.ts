import * as assert from "node:assert";
import { describe, it } from "mocha";
import {
  type RecordedRequest,
  resultText,
  stubErrorReply,
  withContractServer,
} from "./contractHarness.js";

const defaultLanguageId = "00000000-0000-0000-0000-000000000000";
const itemId = "9d1a3c55-1c0f-4c6a-9f3e-0a7d6c2b1e44";
const contentTypeId = "6b2a1c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const titleElementId = "3f1c2a9e-7b64-4d0f-8e21-5a6b7c8d9e0f";

const inputValidationError = "-32602";

const findRequestBody = (
  requests: ReadonlyArray<RecordedRequest>,
  method: string,
  pathEnd: string,
): unknown => {
  const request = requests.find(
    (r) => r.method === method && r.path.endsWith(pathEnd),
  );
  assert.ok(
    request,
    `expected ${method} ...${pathEnd}, got ${JSON.stringify(requests.map((r) => `${r.method} ${r.path}`))}`,
  );
  return request.body;
};

const valueAt = (value: unknown, ...path: ReadonlyArray<string>): unknown =>
  path.reduce<unknown>(
    (current, key) => (current as Record<string, unknown> | undefined)?.[key],
    value,
  );

describe("tool input coercion over Streamable HTTP", () => {
  it("accepts a numeric search_phrase and sends it to the Management API as text", async () => {
    await withContractServer(
      () => stubErrorReply,
      async ({ client, requests }) => {
        const result = await client.callTool({
          name: "list-content-item-variants",
          arguments: {
            search_phrase: 300000,
            language: { id: defaultLanguageId },
          },
        });

        assert.ok(!resultText(result).includes(inputValidationError));
        const body = findRequestBody(
          requests,
          "POST",
          "/early-access/search/variants",
        );
        assert.strictEqual(
          valueAt(body, "filters", "keywords", "expression"),
          "300000",
        );
      },
    );
  });

  it("accepts a numeric searchPhrase for the AI search and sends it as text", async () => {
    await withContractServer(
      () => stubErrorReply,
      async ({ client, requests }) => {
        const result = await client.callTool({
          name: "search-content-item-variants",
          arguments: {
            searchPhrase: 2024,
            filter: { variantId: defaultLanguageId },
          },
        });

        assert.ok(!resultText(result).includes(inputValidationError));
        const body = findRequestBody(
          requests,
          "POST",
          "/early-access/ai-operation",
        );
        assert.strictEqual(
          valueAt(body, "inputs", "searchPhrase", "value"),
          "2024",
        );
      },
    );
  });

  it("accepts a numeric codename when creating a content item", async () => {
    await withContractServer(
      () => stubErrorReply,
      async ({ client, requests }) => {
        const result = await client.callTool({
          name: "create-content-item",
          arguments: {
            name: "Model 2024",
            codename: 2024,
            type: { id: contentTypeId },
          },
        });

        assert.ok(!resultText(result).includes(inputValidationError));
        const body = findRequestBody(requests, "POST", "/items");
        assert.strictEqual(valueAt(body, "codename"), "2024");
      },
    );
  });

  it("reports where a stringified elements array fails to parse, without calling the Management API", async () => {
    await withContractServer(
      () => stubErrorReply,
      async ({ client, requests }) => {
        // One unescaped ASCII quote closing Czech typographic quotes, as in the production traces.
        const elements = `[{"element":{"id":"${titleElementId}"},"value":"<p>Řekl „ano" a odešel</p>"}]`;

        const result = await client.callTool({
          name: "update-content-item-variant",
          arguments: { itemId, languageId: defaultLanguageId, elements },
        });

        const text = resultText(result);
        assert.strictEqual(result.isError, true);
        assert.ok(text.includes(inputValidationError));
        assert.ok(
          text.includes("Sent as a JSON string that could not be parsed"),
        );
        // The parser skips the space after the stray quote and stops at the next word.
        const expectedPosition = elements.indexOf('" a odešel') + 2;
        assert.ok(text.includes(`at position ${expectedPosition}`));
        assert.ok(text.includes('Near: …lue":"<p>Řekl „ano" a odešel</p>"}]…'));
        assert.ok(!text.includes("expected array, received string"));
        assert.strictEqual(requests.length, 0);
      },
    );
  });

  it("still sends a well-formed stringified elements array as an array", async () => {
    await withContractServer(
      () => stubErrorReply,
      async ({ client, requests }) => {
        const result = await client.callTool({
          name: "update-content-item-variant",
          arguments: {
            itemId,
            languageId: defaultLanguageId,
            elements: `[{"element":{"id":"${titleElementId}"},"value":"Model 2024"}]`,
          },
        });

        assert.ok(!resultText(result).includes(inputValidationError));
        const body = findRequestBody(
          requests,
          "PUT",
          `/items/${itemId}/variants/${defaultLanguageId}`,
        );
        assert.deepStrictEqual(valueAt(body, "elements"), [
          { element: { id: titleElementId }, value: "Model 2024" },
        ]);
      },
    );
  });
});
