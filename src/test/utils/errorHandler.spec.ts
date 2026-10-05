import * as assert from "node:assert";
import { SharedModels } from "@kontent-ai/management-sdk";
import { describe, it } from "mocha";
import { handleMcpToolError } from "../../utils/errorHandler.js";

const textOf = (response: { content: Array<{ text: string }> }): string =>
  response.content[0].text;

describe("handleMcpToolError", () => {
  it("takes the typed branch for a falsy requestId and a real errorCode", () => {
    const error = new SharedModels.ContentManagementBaseKontentError({
      message: "boom",
      requestId: "",
      errorCode: 123,
      originalError: new Error("boom"),
      validationErrors: [],
    });

    const text = textOf(handleMcpToolError(error));

    assert.ok(text.includes("Kontent.ai Management API Error:"), text);
    assert.ok(text.includes("boom"), text);
    assert.ok(text.includes("Error Code: 123"), text);
  });

  it("returns a response instead of throwing on a nullish error", () => {
    const response = handleMcpToolError(null);

    assert.strictEqual(response.isError, true);
    assert.ok(textOf(response).includes("Unknown error occurred"));
  });

  // The duck-typed arm exists for the case where class identity is lost across duplicate SDK
  // copies, so the fixture must NOT be a real ContentManagementBaseKontentError. errorCode 0 also
  // pins the `!== undefined` check against a regression to a truthiness test.
  it("takes the typed branch for a plain object carrying only errorCode", () => {
    const text = textOf(handleMcpToolError({ errorCode: 0, message: "nope" }));

    assert.ok(text.includes("Kontent.ai Management API Error:"), text);
    assert.ok(text.includes("Error Code: 0"), text);
  });

  it("keeps the message and drops the Full error dump in the generic branch", () => {
    const error = new Error("missing credentials");
    (error as any).config = { data: '{"secret":"outbound-body"}' };

    const text = textOf(handleMcpToolError(error, "Ctx"));

    assert.ok(!text.includes("Full error:"), text);
    assert.ok(!text.includes("outbound-body"), text);
    assert.strictEqual(text, "Ctx: Unexpected error: missing credentials");
  });

  it("reports a plain thrown string through the generic branch", () => {
    const text = textOf(handleMcpToolError("just a string"));

    assert.ok(!text.includes("Full error:"), text);
    assert.strictEqual(text, "Unexpected error: just a string");
  });
});
