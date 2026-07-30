const MAX_VALUE_LENGTH = 2_000;
const REDACTED = "[redacted]";

type ErrorContext = Record<string, unknown>;

type ObservabilityEvent =
  | {
      context?: ErrorContext;
      message: string;
      name: "error";
      release: string;
      stack?: string;
      timestamp: string;
    }
  | {
      metric: string;
      name: "performance";
      release: string;
      timestamp: string;
      value: number;
    };

type ObservabilityTransport = (
  event: ObservabilityEvent,
) => void | Promise<void>;
type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  value: number;
};

const release = import.meta.env.VITE_RELEASE_ID ?? "unknown";
const endpoint = import.meta.env.VITE_OBSERVABILITY_URL;

const isSensitiveKey = (key: string) =>
  /api[-_]?key|authorization|cookie|password|secret|token/i.test(key);

const sanitizeText = (value: string) =>
  value
    .replaceAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, REDACTED)
    .replaceAll(
      /((?:api[-_]?key|authorization|cookie|password|secret|token)=)[^&\s]+/gi,
      `$1${REDACTED}`,
    )
    .replaceAll(/([?&])[^=\s]+=[^&\s]+/g, `$1${REDACTED}`)
    .slice(0, MAX_VALUE_LENGTH);

export const sanitizeObservabilityValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return sanitizeText(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeObservabilityValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        isSensitiveKey(key)
          ? REDACTED
          : sanitizeObservabilityValue(nestedValue),
      ]),
    );
  }

  return value;
};

const defaultTransport: ObservabilityTransport = async (event) => {
  if (!endpoint) {
    return;
  }

  try {
    await fetch(endpoint, {
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
    });
  } catch {
    // Observability must never disrupt the application.
  }
};

let transport = defaultTransport;
let initialized = false;

export const setObservabilityTransport = (
  nextTransport?: ObservabilityTransport,
) => {
  transport = nextTransport ?? defaultTransport;
};

export const reportError = (error: unknown, context?: ErrorContext): void => {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  void transport({
    context: context
      ? (sanitizeObservabilityValue(context) as ErrorContext)
      : undefined,
    message: sanitizeText(normalizedError.message),
    name: "error",
    release,
    stack: normalizedError.stack
      ? sanitizeText(normalizedError.stack)
      : undefined,
    timestamp: new Date().toISOString(),
  });
};

const reportPerformance = (metric: string, value: number) => {
  void transport({
    metric,
    name: "performance",
    release,
    timestamp: new Date().toISOString(),
    value: Math.round(value * 100) / 100,
  });
};

export const initializeObservability = (): void => {
  if (initialized || typeof window === "undefined") {
    return;
  }
  initialized = true;

  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, {
      column: event.colno,
      filename: event.filename,
      line: event.lineno,
      source: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, { source: "unhandledrejection" });
  });

  if (typeof PerformanceObserver === "undefined") {
    return;
  }

  const supportedTypes = PerformanceObserver.supportedEntryTypes ?? [];

  if (supportedTypes.includes("largest-contentful-paint")) {
    new PerformanceObserver((entryList) => {
      const lastEntry = entryList.getEntries().at(-1);
      if (lastEntry) {
        reportPerformance("largest-contentful-paint", lastEntry.startTime);
      }
    }).observe({ buffered: true, type: "largest-contentful-paint" });
  }

  if (supportedTypes.includes("layout-shift")) {
    new PerformanceObserver((entryList) => {
      const value = entryList
        .getEntries()
        .map((entry) => entry as LayoutShiftEntry)
        .filter((entry) => !entry.hadRecentInput)
        .reduce((total, entry) => total + entry.value, 0);
      if (value > 0) {
        reportPerformance("cumulative-layout-shift", value);
      }
    }).observe({ buffered: true, type: "layout-shift" });
  }

  if (supportedTypes.includes("longtask")) {
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        reportPerformance("long-task", entry.duration);
      });
    }).observe({ buffered: true, type: "longtask" });
  }
};
