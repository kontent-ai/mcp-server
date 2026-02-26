import * as assert from "node:assert";
import { describe, it } from "mocha";
import { createMcpToolSuccessResponse } from "../../utils/responseHelper.js";

describe("createMcpToolSuccessResponse", () => {
  it("returns correct structure with text content", () => {
    const response = createMcpToolSuccessResponse({ key: "value" });
    assert.strictEqual(response.content.length, 1);
    assert.strictEqual(response.content[0].type, "text");
  });

  it("serializes object data as JSON string", () => {
    const input = { id: "123", name: "Test" };
    const response = createMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, input);
  });

  it("serializes nested data as JSON string", () => {
    const input = {
      contentType: {
        id: "type-1",
        name: "Article",
        elements: [
          { id: "el-1", name: "Title" },
          { id: "el-2", codename: "body" },
        ],
      },
    };
    const response = createMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, input);
  });

  it("serializes arrays as JSON string", () => {
    const input = [{ id: "1" }, { id: "2" }];
    const response = createMcpToolSuccessResponse(input);
    const parsed = JSON.parse(response.content[0].text);
    assert.deepStrictEqual(parsed, input);
  });

  it("passes through string values without JSON encoding", () => {
    const response = createMcpToolSuccessResponse("plain text");
    assert.strictEqual(response.content[0].text, "plain text");
  });

  it("returns 'undefined' text when input is undefined", () => {
    const response = createMcpToolSuccessResponse(undefined);
    assert.strictEqual(response.content[0].text, "undefined");
  });

  it("returns valid JSON string when input is null", () => {
    const response = createMcpToolSuccessResponse(null);
    assert.strictEqual(typeof response.content[0].text, "string");
    assert.doesNotThrow(() => JSON.parse(response.content[0].text));
  });
});
