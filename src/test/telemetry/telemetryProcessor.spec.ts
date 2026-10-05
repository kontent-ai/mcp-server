import * as assert from "node:assert";
import { describe, it } from "mocha";
import { createTelemetryProcessor } from "../../telemetry/applicationInsights.js";

describe("telemetry processor", () => {
  it("returns true and stamps the component properties on a normal envelope", () => {
    const processor = createTelemetryProcessor();
    const envelope: any = {
      data: { baseData: { properties: { apiKey: "secret-value" } } },
    };

    const accepted = processor(envelope);

    assert.strictEqual(accepted, true);
    const properties = envelope.data.baseData.properties;
    assert.strictEqual(properties["component.name"], "mcp-server");
    assert.strictEqual(
      properties["component.location"],
      process.env.projectLocation || "unknown",
    );
    assert.strictEqual(properties.apiKey, "[redacted]");
  });

  it("creates the properties bag when the envelope has none", () => {
    const processor = createTelemetryProcessor();
    const envelope: any = { data: { baseData: {} } };

    assert.strictEqual(processor(envelope), true);
    assert.strictEqual(
      envelope.data.baseData.properties["component.name"],
      "mcp-server",
    );
  });

  it("returns false when sanitization throws, and reports it at most once", () => {
    const explodingEnvelope = (): any => {
      const properties: any = {};
      Object.defineProperty(properties, "exploding", {
        enumerable: true,
        get() {
          throw new Error("boom");
        },
      });
      return { data: { baseData: { properties } } };
    };

    const originalError = console.error;
    const lines: string[] = [];
    console.error = (...args: unknown[]) => {
      lines.push(args.join(" "));
    };

    // One processor instance, called twice: the flag lives in the closure, so this is
    // order-independent and `=== 1` also fails if the report is removed entirely.
    const processor = createTelemetryProcessor();

    try {
      assert.strictEqual(processor(explodingEnvelope()), false);
      assert.strictEqual(processor(explodingEnvelope()), false);
    } finally {
      console.error = originalError;
    }

    assert.strictEqual(lines.length, 1, lines.join(" | "));
  });
});
