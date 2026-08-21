import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
  headers: IncomingMessage["headers"];
};

export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
  send(payload: string): void;
};

export type EarningsPostInput = {
  ticker: string;
  company_name: string;
  title: string;
  summary: string[];
  short_summary: string;
  continuation?: string[];
  conclusion: string;
  source_url?: string;
  published_at: string;
};

type ValidationResult =
  | { ok: true; value: EarningsPostInput }
  | { ok: false; errors: string[] };

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

function env(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getSupabaseUrl() {
  return env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
}

export function getSupabaseServiceRoleKey() {
  return env("SUPABASE_SERVICE_ROLE_KEY");
}

function timingSafeEqual(a: string, b: string) {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }
  return mismatch === 0;
}

function getBasicCredentials(header: string | string[] | undefined) {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith("Basic ")) return null;

  try {
    const decoded = Buffer.from(value.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function hasValidAdminAuth(req: ApiRequest) {
  const username = env("ADMIN_USERNAME");
  const password = env("ADMIN_PASSWORD");
  if (!username || !password) return false;

  const credentials = getBasicCredentials(req.headers.authorization);
  if (!credentials) return false;

  return timingSafeEqual(credentials.username, username) && timingSafeEqual(credentials.password, password);
}

export function sendUnauthorized(res: ApiResponse) {
  res.setHeader("WWW-Authenticate", 'Basic realm="admin"');
  res.setHeader("Cache-Control", "no-store");
  sendJson(res, 401, { error: "Unauthorized" });
}

export function sendJson(res: ApiResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(payload));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function isOptionalStringArray(value: unknown): value is string[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every(isNonEmptyString));
}

function isDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function validateEarningsPostInput(value: unknown): ValidationResult {
  if (!isPlainObject(value)) {
    return { ok: false, errors: ["JSONのトップレベルはオブジェクトにしてください。"] };
  }

  const errors: string[] = [];
  const requiredStrings = [
    "ticker",
    "company_name",
    "title",
    "short_summary",
    "conclusion",
    "published_at",
  ] as const;

  requiredStrings.forEach((field) => {
    if (!isNonEmptyString(value[field])) {
      errors.push(`${field} は必須の文字列です。`);
    }
  });

  if (!isStringArray(value.summary)) {
    errors.push("summary は1件以上の文字列配列にしてください。");
  }

  if (!isOptionalStringArray(value.continuation)) {
    errors.push("continuation は文字列配列にしてください。");
  }

  if (value.source_url !== undefined && typeof value.source_url !== "string") {
    errors.push("source_url は文字列にしてください。");
  }

  if (isNonEmptyString(value.published_at) && !isDateString(value.published_at)) {
    errors.push("published_at は YYYY-MM-DD 形式の日付にしてください。");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      ticker: String(value.ticker).trim(),
      company_name: String(value.company_name).trim(),
      title: String(value.title).trim(),
      summary: (value.summary as string[]).map((item) => item.trim()),
      short_summary: String(value.short_summary).trim(),
      continuation: value.continuation
        ? (value.continuation as string[]).map((item) => item.trim())
        : undefined,
      conclusion: String(value.conclusion).trim(),
      source_url: value.source_url ? String(value.source_url).trim() : undefined,
      published_at: String(value.published_at).trim(),
    },
  };
}

export async function readJsonBody(req: ApiRequest) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  if (req.body !== undefined) {
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

export function sendMethodNotAllowed(res: ApiResponse, allowed: string[]) {
  res.setHeader("Allow", allowed.join(", "));
  sendJson(res, 405, { error: "Method Not Allowed" });
}
