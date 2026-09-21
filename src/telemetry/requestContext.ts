import { AsyncLocalStorage } from "node:async_hooks";

const clientIdStorage = new AsyncLocalStorage<string | undefined>();

/**
 * Runs `fn` with `clientId` (the Kontent.ai environment ID) bound to the current
 * async context, so telemetry emitted anywhere during `fn` can read it via
 * `getCurrentClientId`. Used to scope the multi-tenant Streamable HTTP request's
 * environment ID to that request's lifetime.
 */
export function runWithClientId<T>(
  clientId: string | undefined,
  fn: () => T,
): T {
  return clientIdStorage.run(clientId, fn);
}

export function getCurrentClientId(): string | undefined {
  return clientIdStorage.getStore();
}
