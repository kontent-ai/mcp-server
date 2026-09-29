const REDACTED = "[redacted]";
const MAX_DEPTH = 10;

// Property/attribute NAMES whose value is masked wholesale. Adapted from connector-auth-service,
// which took it from the OWASP Logging Cheat Sheet cross-checked against Google Cloud DLP.
// `x-kc-` and `bearer` are added for this service.
//
// `key\b` (a trailing boundary only) is deliberate: it keeps everything a plain `key` substring
// caught - `apiKey`, a SCREAMING_SNAKE name ending in `_API_KEY`, `accountKey`, `sharedKey`,
// `masterKey` - while leaving `keywords` and `monkeyId` alone. A narrower `api[-_]?key` silently
// dropped the `*Key` family.
//
// Two names from the source this was adapted from are deliberately absent:
//   - `\bcode\b`: that service runs an OAuth flow where `code` is the authorization code. Here
//     `code` is a diagnostic (`ENOENT`, an error code) and masking it would gut the telemetry.
//     It stays in the query-parameter pattern below, where `code=` is likelier to be a credential.
//   - `session`: this server is stateless (`sessionIdGenerator: undefined`) and has no session
//     secret, but the App Insights correlation tag `ai.session.id` matches, so including it would
//     break session correlation for nothing.
//
// The credential variable name is deliberately not spelled out here: src/test/security/
// noAmbientCredentials.spec.ts scans shipped comments as well as code.
const SENSITIVE_KEY =
  /authoriz|bearer|cookie|password|passwd|passphrase|\bpwd\b|secret|token|credential|key\b|x-kc-/i;

function isSensitive(key: string): boolean {
  return SENSITIVE_KEY.test(key);
}

// The token run stops at quote, comma and semicolon so that redacting a token embedded in a
// serialized payload does not swallow the rest of the structure. `.` is deliberately NOT a stop
// character: a JWT contains two, and stopping there would emit the remaining segments.
const bearerPattern = /\bbearer\s+[^\s"',;]+/gi;
// Management API keys are JWTs (src/utils/extractUserIdFromToken.ts decodes one), so this
// catches a key echoed back without the `bearer ` prefix - the case @kontent-ai/core-sdk's
// own redaction cannot see, because it only knows the literal `bearer <key>` string.
// The lookbehind stops the scan restarting inside a run of `eyJ`: without it, input like
// "eyJeyJeyJ..." is rescanned from every position, which is quadratic - 100kB of it blocks the
// event loop for ~2s, and rich text values are allowed up to 100k characters. The cost is that a
// JWT glued straight onto a word character is no longer matched; every realistic delimiter
// (`=`, `:`, `"`, `/`, whitespace, start of string) still is.
// All three segments require {5,} (connector-auth-service's form): a stricter shape than `+`,
// with fewer false positives on dotted identifiers.
const jwtPattern =
  /(?<![A-Za-z0-9_-])eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g;

// A header line in dumped free text. Anchored to line start (m) so a header name never matches
// inside a value, and bounded so it cannot run away. The optional quotes catch the
// `'x-api-key': 'value'` shape that util.inspect produces. The separator uses [ \t] rather than
// \s: \s matches a newline, so an empty header value would consume - and redact - the next line.
const headerLinePattern =
  /^([ \t]*)(["']?)(proxy-authorization|authorization|set-cookie|cookie|x-api-key|api-key|x-auth-token|auth-token|x-kc-[a-z-]*key)(["']?)([ \t]*[:=][ \t]*)[^\r\n]{1,8192}/gim;

// `<name>=<value>` in a query string or body, where the value runs to the next delimiter. Broad
// on names but each must be glued to `=`, so it cannot fire on structured keys like `partitionKey`.
// This is what catches a NON-JWT secret in a URL, which stripping the query off `data.url` misses
// because free text (exception messages, property values) never goes through `sanitizeUrl`.
const secretParamPattern =
  /\b(client_secret|access_token|refresh_token|id_token|assertion|password|api[-_]?key|apikey|access[-_]?key|secrets?|tokens?|credentials?|auth|signature|sig|sas|\bkey\b|\bcode\b)(=)[^\s&"'#]{1,4096}/gi;

const valuePatterns: ReadonlyArray<readonly [RegExp, string]> = [
  [jwtPattern, REDACTED],
  [headerLinePattern, `$1$2$3$4$5${REDACTED}`],
  [bearerPattern, `bearer ${REDACTED}`],
  [secretParamPattern, `$1$2${REDACTED}`],
];

function redactText(text: string): string {
  let out = text;
  for (const [pattern, replacement] of valuePatterns) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/** Parses a JSON-encoded object or array; undefined for anything else, scalars included. */
function tryParseJsonContainer(text: string): object | undefined {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return undefined;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed !== null && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function redactJsonValue(value: unknown, depth: number): unknown {
  if (typeof value === "string") return redactString(value, depth);

  // Truncate an over-deep container rather than recursing, matching sanitizeObject. Without this
  // only nested strings were bounded, and a deep payload had to overflow the stack before the
  // caller's catch masked the whole value.
  if (depth >= MAX_DEPTH && value !== null && typeof value === "object") {
    return REDACTED;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactJsonValue(item, depth + 1));
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = isSensitive(key)
        ? REDACTED
        : redactJsonValue(nested, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Redacts free text, deep-redacting it first when it is JSON.
 *
 * This matters because Application Insights flattens object-valued properties to JSON strings
 * *before* any telemetry processor runs, so by the time the walk in `sanitizeObject` sees them
 * they are strings and key-based redaction can no longer reach inside. Parsing the JSON back
 * restores it - otherwise only the text patterns apply, and `{"apiKey":"not-a-jwt"}` survives.
 *
 * The round trip normalizes what it touches: whitespace and pretty-printing are dropped, `1.0`
 * becomes `1`, and a `__proto__` key disappears. Fine for telemetry, but a redacted value is not
 * byte-identical to the original.
 */
function redactString(value: string, depth = 0): string {
  if (depth < MAX_DEPTH) {
    const parsed = tryParseJsonContainer(value);
    if (parsed !== undefined) {
      try {
        return JSON.stringify(redactJsonValue(parsed, depth + 1));
      } catch {
        // JSON.stringify recurses the whole structure while redactJsonValue stops at MAX_DEPTH,
        // so deeper nesting overflows here. Text patterns cannot clean JSON reliably (secrets
        // sit after `:`, not `=`), so mask the value outright.
        return REDACTED;
      }
    }
  }

  return redactText(value);
}

// `seen` guards cycles and `depth` guards runaway nesting, because a throw out of a telemetry
// processor makes Application Insights send the envelope UNSANITIZED (TelemetryClient.js:
// `catch { accepted = true; }`). This is not throw-proof - assigning to a frozen property or
// reading a throwing getter still raises - so the processor catches and drops the envelope.
function sanitizeObject(
  obj: any,
  depth = 0,
  seen: WeakSet<object> = new WeakSet(),
): void {
  if (!obj || typeof obj !== "object") return;
  if (seen.has(obj)) return;
  seen.add(obj);

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (isSensitive(key)) {
      obj[key] = REDACTED;
      continue;
    }

    if (typeof value === "string") {
      obj[key] = redactString(value, depth);
      continue;
    }

    if (value && typeof value === "object") {
      if (depth >= MAX_DEPTH) {
        // Redact rather than leave the subtree unvisited: stopping the walk would pass
        // deep sensitive keys through untouched.
        obj[key] = REDACTED;
        continue;
      }
      sanitizeObject(value, depth + 1, seen);
    }
  }
}

// In applicationinsights 2.9.8 an exception envelope carries `message`, `typeName`,
// `hasFullStack` and `parsedStack[]`. The stack text is split into frames whose
// `assembly`/`fileName`/`method` hold the raw line text; `stack` is covered defensively in
// case a future version reinstates it. `problemId` is declared on the contract but never
// assigned client-side, so it needs nothing.
function sanitizeExceptions(exceptions: any): void {
  if (!Array.isArray(exceptions)) return;

  for (const exception of exceptions) {
    if (!exception || typeof exception !== "object") continue;

    for (const field of ["message", "typeName", "stack"]) {
      if (typeof exception[field] === "string") {
        exception[field] = redactString(exception[field]);
      }
    }

    if (!Array.isArray(exception.parsedStack)) continue;

    for (const frame of exception.parsedStack) {
      if (!frame || typeof frame !== "object") continue;
      for (const field of ["assembly", "fileName", "method"]) {
        if (typeof frame[field] === "string") {
          frame[field] = redactText(frame[field]);
        }
      }
    }
  }
}

export function sanitizeUrl(url: string): string {
  return url.split("?")[0];
}

/**
 * Renders an arbitrary thrown value as a bounded, sanitized string.
 *
 * Key-based redaction cannot reach text, so anything that turns a structured value into text
 * must sanitize the structure FIRST - otherwise `{ apiKey: "..." }` survives as a JSON string.
 */
export function sanitizeUnknownValue(value: unknown, maxLength = 500): string {
  let text: string;

  try {
    if (typeof value === "string") {
      text = value;
    } else if (value && typeof value === "object") {
      const clone = JSON.parse(JSON.stringify(value));
      sanitizeObject(clone);
      text = JSON.stringify(clone);
    } else {
      text = String(value);
    }
  } catch {
    text = "[unserializable]";
  }

  return redactString(text).slice(0, maxLength);
}

/**
 * Renders any thrown value for a console log: the stack when there is one, redacted.
 *
 * Logging the raw value would print a Management API key in cleartext when it sits inside an
 * axios error, which is why these call sites stopped passing the error object. Dropping to
 * `error.message` also lost the stack, so this restores that without restoring the leak.
 *
 * Note what is still lost relative to `console.error(error)`: `cause`, `AggregateError.errors`,
 * and a `code` carried as a property. A Node system error keeps its code (it is part of the name
 * or message, e.g. `ERR_SOCKET_BAD_PORT`), but an `AxiosError`'s `code` does not survive.
 *
 * `stack` and `message` are read defensively: they are typed as strings but are ordinary
 * properties, so a caller-shaped "error" can carry a non-string or a throwing getter, and this
 * runs on crash paths where throwing would replace the diagnostic it exists to print.
 */
export function sanitizeErrorForLog(error: unknown): string {
  if (error instanceof Error) {
    // Each property is read independently: a throwing `stack` getter must not cost us the
    // message. Empty strings are rejected too - `Error.prototype.message` is "", so a bare
    // prototype object would otherwise log nothing at all.
    const read = (key: "stack" | "message" | "name"): string | undefined => {
      try {
        const value = error[key];
        return typeof value === "string" && value !== "" ? value : undefined;
      } catch {
        return undefined;
      }
    };

    const text = read("stack") ?? read("message") ?? read("name");
    if (text !== undefined) {
      return redactString(text);
    }
  }

  return sanitizeUnknownValue(error);
}

export function sanitizeTelemetry(envelope: any): void {
  // Tags are sanitized before the baseData guard: an envelope without baseData used to skip
  // tag sanitization entirely.
  if (envelope?.tags) {
    sanitizeObject(envelope.tags);
  }

  const data = envelope?.data?.baseData;
  if (!data) return;

  if (data.properties) {
    sanitizeObject(data.properties);
  }

  if (data.exceptions) {
    sanitizeExceptions(data.exceptions);
  }

  if (typeof data.message === "string") {
    data.message = redactString(data.message);
  }

  if (typeof data.url === "string") {
    data.url = sanitizeUrl(data.url);
  }

  // RemoteDependencyData carries the outbound URL in `data`, not `url`. Dependency collection
  // is currently off, so this is pre-emptive.
  if (typeof data.data === "string") {
    data.data = sanitizeUrl(data.data);
  }
}
