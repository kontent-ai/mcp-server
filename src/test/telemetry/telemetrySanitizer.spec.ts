import * as assert from "node:assert";
import { describe, it } from "mocha";
import {
  sanitizeErrorForLog,
  sanitizeTelemetry,
  sanitizeUnknownValue,
} from "../../telemetry/telemetrySanitizer.js";

const REDACTED = "[redacted]";
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

const exceptionEnvelope = (exceptions: unknown): any => ({
  data: { baseData: { exceptions } },
});

describe("sanitizeTelemetry - exceptions", () => {
  it("redacts a bearer token without swallowing the surrounding structure", () => {
    const envelope = exceptionEnvelope([
      {
        message: '{"authorization":"bearer abc123def456","requestId":"r-1"}',
      },
    ]);

    sanitizeTelemetry(envelope);

    const message = envelope.data.baseData.exceptions[0].message;
    assert.ok(!message.includes("abc123def456"), message);
    // The token run stops at the closing quote: an unbounded \S+ would eat the rest of the line.
    assert.ok(message.includes('"requestId":"r-1"'), message);
  });

  it("redacts a bare JWT in the exception message", () => {
    const envelope = exceptionEnvelope([{ message: `key=${SAMPLE_JWT} used` }]);

    sanitizeTelemetry(envelope);

    const message = envelope.data.baseData.exceptions[0].message;
    assert.strictEqual(message, `key=${REDACTED} used`);
  });

  it("redacts typeName and every parsedStack frame field", () => {
    const envelope = exceptionEnvelope([
      {
        message: "ok",
        typeName: `Error bearer secret-one`,
        parsedStack: [
          {
            assembly: `at send (bearer secret-two)`,
            fileName: `/app/${SAMPLE_JWT}/index.js`,
            method: `call bearer secret-three`,
          },
        ],
      },
    ]);

    sanitizeTelemetry(envelope);

    const exception = envelope.data.baseData.exceptions[0];
    const frame = exception.parsedStack[0];
    assert.ok(!exception.typeName.includes("secret-one"), exception.typeName);
    assert.ok(!frame.assembly.includes("secret-two"), frame.assembly);
    assert.ok(!frame.fileName.includes(SAMPLE_JWT), frame.fileName);
    assert.ok(!frame.method.includes("secret-three"), frame.method);
  });

  // The fixtures must be NON-iterable. A string is iterable, so it walks the loop harmlessly and
  // the test would pass with the Array.isArray guard removed.
  it("does not throw when exceptions is a non-iterable value", () => {
    assert.doesNotThrow(() => sanitizeTelemetry(exceptionEnvelope(42)));
    assert.doesNotThrow(() => sanitizeTelemetry(exceptionEnvelope({ a: 1 })));
  });
});

describe("sanitizeTelemetry - properties", () => {
  it("redacts sensitive keys and keeps diagnostic ones", () => {
    const envelope: any = {
      data: {
        baseData: {
          properties: {
            apiKey: "secret-value",
            KONTENT_API_KEY: "another-secret",
            errorCode: 429,
            requestId: "req-abc",
          },
        },
      },
    };

    sanitizeTelemetry(envelope);

    const properties = envelope.data.baseData.properties;
    assert.strictEqual(properties.apiKey, REDACTED);
    assert.strictEqual(properties.KONTENT_API_KEY, REDACTED);
    assert.strictEqual(properties.errorCode, 429);
    assert.strictEqual(properties.requestId, "req-abc");
  });

  it("redacts a token in a non-sensitive value, at any depth", () => {
    const envelope: any = {
      data: {
        baseData: {
          properties: {
            headersDump: "sent with bearer abc123def456",
            nested: { note: `token ${SAMPLE_JWT} used` },
          },
        },
      },
    };

    sanitizeTelemetry(envelope);

    const properties = envelope.data.baseData.properties;
    assert.ok(
      !properties.headersDump.includes("abc123def456"),
      properties.headersDump,
    );
    assert.ok(
      !properties.nested.note.includes(SAMPLE_JWT),
      properties.nested.note,
    );
  });

  // Pins the `seen` WeakSet. Without it the walk does not throw - MAX_DEPTH stops it - but it
  // overwrites the caller's own back-reference with "[redacted]" at depth 10.
  it("leaves a cyclic properties graph intact", () => {
    const properties: any = { note: "hi" };
    properties.self = properties;

    sanitizeTelemetry({ data: { baseData: { properties } } });

    assert.strictEqual(properties.self, properties);
  });

  it("redacts an over-deep subtree instead of passing it through", () => {
    const properties: any = {};
    let cursor = properties;
    for (let i = 0; i < 12; i += 1) {
      cursor.nested = {};
      cursor = cursor.nested;
    }
    cursor.apiKey = "deep-secret";

    const envelope: any = { data: { baseData: { properties } } };
    sanitizeTelemetry(envelope);

    assert.ok(
      !JSON.stringify(envelope).includes("deep-secret"),
      JSON.stringify(envelope),
    );
    // The subtree is redacted at MAX_DEPTH rather than walked to the leaf.
    let node: any = properties;
    for (let i = 0; i < 10; i += 1) {
      node = node.nested;
    }
    assert.strictEqual(node.nested, REDACTED);
  });
});

describe("sanitizeTelemetry - envelope shape", () => {
  it("sanitizes tags even when baseData is absent", () => {
    const envelope: any = { tags: { "ai.user.authToken": "secret-value" } };

    sanitizeTelemetry(envelope);

    assert.strictEqual(envelope.tags["ai.user.authToken"], REDACTED);
  });

  it("redacts free text in a message envelope", () => {
    const envelope: any = {
      data: { baseData: { message: "sent bearer abc123def456" } },
    };

    sanitizeTelemetry(envelope);

    assert.strictEqual(
      envelope.data.baseData.message,
      `sent bearer ${REDACTED}`,
    );
  });

  it("strips the query string from a url", () => {
    const envelope: any = {
      data: { baseData: { url: "https://example.com/a?key=secret-value" } },
    };

    sanitizeTelemetry(envelope);

    assert.strictEqual(envelope.data.baseData.url, "https://example.com/a");
  });

  it("strips the query string from dependency data", () => {
    const envelope: any = {
      data: { baseData: { data: "https://example.com/a?key=secret-value" } },
    };

    sanitizeTelemetry(envelope);

    assert.strictEqual(envelope.data.baseData.data, "https://example.com/a");
  });

  // Not redundant with the query-stripping test: a refactor to
  // `url.substring(0, url.indexOf("?"))` returns "" here, which would blank the url on every
  // HTTP-error telemetry item, since axios `config.url` is usually query-less.
  it("leaves a url without a query string unchanged", () => {
    const envelope: any = {
      data: { baseData: { url: "https://example.com/a" } },
    };

    sanitizeTelemetry(envelope);

    assert.strictEqual(envelope.data.baseData.url, "https://example.com/a");
  });

  it("does not throw on a null envelope", () => {
    assert.doesNotThrow(() => sanitizeTelemetry(null));
  });
});

describe("sanitizeUnknownValue", () => {
  it("redacts a sensitive key inside a thrown object", () => {
    const text = sanitizeUnknownValue({ apiKey: "secret-value", code: "X" });

    assert.ok(!text.includes("secret-value"), text);
    assert.ok(text.includes("X"), text);
  });

  it("redacts a bearer token in a thrown string", () => {
    assert.strictEqual(
      sanitizeUnknownValue("failed with bearer abc123def456"),
      `failed with bearer ${REDACTED}`,
    );
  });

  it("bounds the output length", () => {
    assert.strictEqual(sanitizeUnknownValue("x".repeat(900)).length, 500);
  });

  it("does not throw on a cyclic thrown object", () => {
    const cyclic: any = {};
    cyclic.self = cyclic;

    assert.doesNotThrow(() => sanitizeUnknownValue(cyclic));
  });

  it("renders primitives", () => {
    assert.strictEqual(sanitizeUnknownValue(42), "42");
    assert.strictEqual(sanitizeUnknownValue(null), "null");
    assert.strictEqual(sanitizeUnknownValue(undefined), "undefined");
  });
});

describe("sanitizeTelemetry - adopted value patterns", () => {
  it("redacts a non-JWT secret in a query parameter, which sanitizeUrl cannot reach", () => {
    const envelope = exceptionEnvelope([
      { message: "GET https://h/x?api_key=plain-not-a-jwt&page=2 failed" },
    ]);

    sanitizeTelemetry(envelope);

    const message = envelope.data.baseData.exceptions[0].message;
    assert.ok(!message.includes("plain-not-a-jwt"), message);
    assert.ok(message.includes("page=2"), message);
  });

  it("redacts a header line without touching benign lines", () => {
    const envelope = exceptionEnvelope([
      { message: "x-api-key: plain-secret\ncontent-type: application/json" },
    ]);

    sanitizeTelemetry(envelope);

    const message = envelope.data.baseData.exceptions[0].message;
    assert.ok(!message.includes("plain-secret"), message);
    assert.ok(message.includes("content-type: application/json"), message);
  });

  // App Insights flattens object-valued properties to JSON strings before any processor runs,
  // so without the JSON round-trip only the text patterns would apply here.
  it("redacts a sensitive key inside a JSON-encoded property value", () => {
    const envelope: any = {
      data: {
        baseData: {
          properties: {
            payload: '{"apiKey":"plain-not-a-jwt","itemId":"abc"}',
          },
        },
      },
    };

    sanitizeTelemetry(envelope);

    const payload = envelope.data.baseData.properties.payload;
    assert.ok(!payload.includes("plain-not-a-jwt"), payload);
    assert.ok(payload.includes("abc"), payload);
  });

  it("redacts the whole *Key family, not just apiKey", () => {
    const envelope: any = {
      data: {
        baseData: {
          properties: {
            accountKey: "s1",
            sharedKey: "s2",
            masterKey: "s3",
            KONTENT_API_KEY: "s4",
          },
        },
      },
    };

    sanitizeTelemetry(envelope);

    for (const value of Object.values(envelope.data.baseData.properties)) {
      assert.strictEqual(value, REDACTED);
    }
  });

  it("leaves the App Insights session correlation tag alone", () => {
    const envelope: any = { tags: { "ai.session.id": "abc-123" } };

    sanitizeTelemetry(envelope);

    assert.strictEqual(envelope.tags["ai.session.id"], "abc-123");
  });

  it("does not let an empty header value consume the next line", () => {
    const envelope = exceptionEnvelope([
      { message: "x-api-key:\nkeep-this-next-line" },
    ]);

    sanitizeTelemetry(envelope);

    const message = envelope.data.baseData.exceptions[0].message;
    assert.ok(message.includes("keep-this-next-line"), message);
  });

  // The lookbehind is what makes the JWT scan linear; a "simplification" that drops it
  // reintroduces a ~2s event-loop stall on repeated `eyJ`. Pinning both halves of the trade-off.
  it("matches a JWT after a delimiter but not one glued to a word character", () => {
    const envelope = exceptionEnvelope([
      { message: `a=${SAMPLE_JWT} and abc${SAMPLE_JWT}` },
    ]);

    sanitizeTelemetry(envelope);

    const message = envelope.data.baseData.exceptions[0].message;
    assert.ok(message.includes(`a=${REDACTED}`), message);
    assert.ok(message.includes(`abc${SAMPLE_JWT}`), message);
  });

  it("keeps diagnostic property names that a plain substring match would redact", () => {
    const envelope: any = {
      data: {
        baseData: {
          properties: { keywords: "a,b", monkeyId: "m1", code: "ENOENT" },
        },
      },
    };

    sanitizeTelemetry(envelope);

    const properties = envelope.data.baseData.properties;
    assert.strictEqual(properties.keywords, "a,b");
    assert.strictEqual(properties.monkeyId, "m1");
    assert.strictEqual(properties.code, "ENOENT");
  });
});

describe("sanitizeErrorForLog", () => {
  it("keeps the stack, which carries the error class and a system error code", () => {
    const error = new RangeError("options.port should be >= 0");

    const text = sanitizeErrorForLog(error);

    assert.ok(text.includes("RangeError"), text);
    assert.ok(text.includes("options.port should be >= 0"), text);
    assert.ok(text.includes("at "), text);
  });

  it("redacts a token carried in the message", () => {
    const text = sanitizeErrorForLog(
      new Error(`request failed: ${SAMPLE_JWT}`),
    );

    assert.ok(!text.includes(SAMPLE_JWT), text);
    assert.ok(text.includes(REDACTED), text);
  });

  // These run on crash paths, where a throw would replace the diagnostic being printed.
  it("does not throw when stack is not a string", () => {
    const error = new Error("boom");
    (error as any).stack = { not: "a string" };

    assert.strictEqual(sanitizeErrorForLog(error), "boom");
  });

  it("does not throw when reading stack throws", () => {
    const error = new Error("boom");
    Object.defineProperty(error, "stack", {
      get() {
        throw new Error("nope");
      },
    });

    assert.doesNotThrow(() => sanitizeErrorForLog(error));
  });

  // Error.prototype.message is "", so an empty string must not be accepted as the text.
  it("never renders as an empty string", () => {
    const text = sanitizeErrorForLog(Object.create(Error.prototype));

    assert.notStrictEqual(text, "");
  });

  it("renders a non-Error through the sanitized unknown-value path", () => {
    const text = sanitizeErrorForLog({
      code: "ENOENT",
      apiKey: "secret-value",
    });

    assert.ok(text.includes("ENOENT"), text);
    assert.ok(!text.includes("secret-value"), text);
  });
});
