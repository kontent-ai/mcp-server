import * as assert from "node:assert";
import { describe, it } from "mocha";
import {
  missingCredentialsMessage,
  partialCredentialsMessage,
  resolveCredentials,
  setSingleTenantCredentials,
} from "../../clients/credentials.js";
import { allTools } from "../../tools/index.js";
import { getPatchGuideToolName } from "../../tools/referencedToolNames.js";

// SE-325 item 3. Credentials must never be borrowed from the process: a request
// carrying none of its own has to fail rather than run under whatever the
// environment happens to hold. The env-var cases below are the regression tests
// for exactly that - they set both variables and still expect a failure.

const REQUEST_ENVIRONMENT_ID = "11111111-1111-1111-1111-111111111111";
const REQUEST_API_KEY = "request-api-key";
const SINGLE_TENANT_ENVIRONMENT_ID = "22222222-2222-2222-2222-222222222222";
const SINGLE_TENANT_API_KEY = "single-tenant-api-key";

// Mocha runs every spec in one process, so both the configured credentials and
// the environment have to be restored even when an assertion throws.
const withSingleTenantCredentials = async (
  run: () => void | Promise<void>,
): Promise<void> => {
  const dispose = setSingleTenantCredentials({
    environmentId: SINGLE_TENANT_ENVIRONMENT_ID,
    apiKey: SINGLE_TENANT_API_KEY,
  });
  try {
    await run();
  } finally {
    dispose();
  }
};

const restore = (name: string, value: string | undefined): void => {
  // `delete` rather than assigning undefined: assigning would leave the literal
  // string "undefined" behind for any later spec that reads the variable.
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
};

const withCredentialEnvVars = async (
  run: () => void | Promise<void>,
): Promise<void> => {
  const previousApiKey = process.env.KONTENT_API_KEY;
  const previousEnvironmentId = process.env.KONTENT_ENVIRONMENT_ID;
  process.env.KONTENT_API_KEY = "environment-api-key";
  process.env.KONTENT_ENVIRONMENT_ID = "33333333-3333-3333-3333-333333333333";
  try {
    await run();
  } finally {
    restore("KONTENT_API_KEY", previousApiKey);
    restore("KONTENT_ENVIRONMENT_ID", previousEnvironmentId);
  }
};

describe("credential resolution", () => {
  it("returns the credentials the request supplied", () => {
    // Distinct sentinels: both parameters are `string | undefined`, so a swapped
    // pair compiles and only an assertion on the values can catch it.
    assert.deepStrictEqual(
      resolveCredentials(REQUEST_ENVIRONMENT_ID, REQUEST_API_KEY),
      { environmentId: REQUEST_ENVIRONMENT_ID, apiKey: REQUEST_API_KEY },
    );
  });

  it("rejects an environment ID without an API key", () => {
    assert.throws(
      () => resolveCredentials(REQUEST_ENVIRONMENT_ID, undefined),
      new Error(partialCredentialsMessage),
    );
  });

  it("rejects an API key without an environment ID", () => {
    assert.throws(
      () => resolveCredentials(undefined, REQUEST_API_KEY),
      new Error(partialCredentialsMessage),
    );
  });

  it("treats an empty API key as supplied-but-incomplete, not as absent", () => {
    assert.throws(
      () => resolveCredentials(REQUEST_ENVIRONMENT_ID, ""),
      new Error(partialCredentialsMessage),
    );
  });

  it("rejects a request that supplied no credentials at all", () => {
    assert.throws(
      () => resolveCredentials(undefined, undefined),
      new Error(missingCredentialsMessage),
    );
  });

  it("ignores the credential environment variables", async () => {
    await withCredentialEnvVars(() => {
      assert.throws(
        () => resolveCredentials(undefined, undefined),
        new Error(missingCredentialsMessage),
      );
    });
  });

  it("falls back to the single-tenant credentials once they are configured", async () => {
    await withSingleTenantCredentials(() => {
      assert.deepStrictEqual(resolveCredentials(undefined, undefined), {
        environmentId: SINGLE_TENANT_ENVIRONMENT_ID,
        apiKey: SINGLE_TENANT_API_KEY,
      });
    });
  });

  it("prefers the request's credentials over the single-tenant ones", async () => {
    await withSingleTenantCredentials(() => {
      assert.deepStrictEqual(
        resolveCredentials(REQUEST_ENVIRONMENT_ID, REQUEST_API_KEY),
        { environmentId: REQUEST_ENVIRONMENT_ID, apiKey: REQUEST_API_KEY },
      );
    });
  });

  it("never completes a half pair from the single-tenant credentials", async () => {
    await withSingleTenantCredentials(() => {
      assert.throws(
        () => resolveCredentials(REQUEST_ENVIRONMENT_ID, undefined),
        new Error(partialCredentialsMessage),
      );
      assert.throws(
        () => resolveCredentials(undefined, REQUEST_API_KEY),
        new Error(partialCredentialsMessage),
      );
    });
  });

  it("stops falling back once the single-tenant credentials are disposed", () => {
    const dispose = setSingleTenantCredentials({
      environmentId: SINGLE_TENANT_ENVIRONMENT_ID,
      apiKey: SINGLE_TENANT_API_KEY,
    });
    dispose();
    assert.throws(
      () => resolveCredentials(undefined, undefined),
      new Error(missingCredentialsMessage),
    );
  });
});

// get-patch-guide returns static guidance and calls no API, so it is the one
// tool that works without credentials. A future credential-free tool has to be
// added here, which keeps the exemption visible in review.
const credentialFreeTools = new Set<string>([getPatchGuideToolName]);

// Tools build their client either before their `try` (the call throws) or inside
// it (the throw is turned into an error response), so both shapes count as
// failing closed.
const callWithoutCredentials = async (handler: unknown): Promise<string> => {
  const run = handler as (
    args: unknown,
    extra: unknown,
  ) => Promise<{ isError?: boolean; content?: Array<{ text?: string }> }>;

  try {
    const response = await run({}, {});
    return response.isError
      ? (response.content?.[0]?.text ?? "")
      : "the tool returned a success response";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

const assertEveryToolFailsClosed = async (): Promise<void> => {
  for (const tool of Object.values(allTools)) {
    if (credentialFreeTools.has(tool.name)) {
      continue;
    }

    const outcome = await callWithoutCredentials(tool.handler);
    assert.ok(
      outcome.includes(missingCredentialsMessage),
      `${tool.name} did not fail closed without credentials: ${outcome}`,
    );
  }
};

describe("tools called without credentials", () => {
  it("every tool that calls the API fails closed", async () => {
    await assertEveryToolFailsClosed();
  });

  it("no tool falls back to the credential environment variables", async () => {
    await withCredentialEnvVars(assertEveryToolFailsClosed);
  });
});
