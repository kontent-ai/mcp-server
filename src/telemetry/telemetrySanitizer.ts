const SENSITIVE_KEYWORDS = [
  "authorization",
  "x-authorization",
  "x-api-key",
  "bearer",
  "token",
  "password",
  "secret",
  "key",
  "pwd",
  "pass",
  "credential",
  "x-kc-",
  "cookie",
];

function isSensitive(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYWORDS.some((keyword) => lowerKey.includes(keyword));
}

function sanitizeObject(obj: any): void {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    if (isSensitive(key)) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  });
}

export function sanitizeUrl(url: string): string {
  return url.split("?")[0];
}

export function sanitizeTelemetry(envelope: any): void {
  if (!envelope.data?.baseData) return;

  const data = envelope.data.baseData;

  if (envelope.tags) {
    sanitizeObject(envelope.tags);
  }

  if (data.properties) {
    sanitizeObject(data.properties);
  }

  if (data.url) {
    data.url = sanitizeUrl(data.url);
  }
}
