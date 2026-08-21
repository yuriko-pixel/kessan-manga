import type { ApiRequest, ApiResponse, EarningsPostInput } from "../_admin";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasValidAdminAuth,
  readJsonBody,
  sendJson,
  sendMethodNotAllowed,
  sendUnauthorized,
  validateEarningsPostInput,
} from "../_admin";

type SupabaseError = {
  message?: string;
};

function postgrestFilter(value: string) {
  return `eq.${encodeURIComponent(value)}`;
}

function buildSupabaseEndpoint(path: string, query: string) {
  const url = getSupabaseUrl();
  if (!url) throw new Error("Supabase URL is not configured.");
  return `${url.replace(/\/$/, "")}/rest/v1/${path}?${query}`;
}

function serviceHeaders() {
  const key = getSupabaseServiceRoleKey();
  if (!key) throw new Error("Supabase service role key is not configured.");

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function findDuplicate(input: EarningsPostInput) {
  const query = [
    "select=id,title",
    `ticker=${postgrestFilter(input.ticker)}`,
    `published_at=${postgrestFilter(input.published_at)}`,
    `title=${postgrestFilter(input.title)}`,
    "limit=1",
  ].join("&");

  const response = await fetch(buildSupabaseEndpoint("earnings_posts", query), {
    headers: serviceHeaders(),
  });

  if (!response.ok) {
    throw new Error("Duplicate check failed.");
  }

  const rows = (await response.json()) as Array<{ id: string; title: string }>;
  return rows[0];
}

async function insertPost(input: EarningsPostInput) {
  const response = await fetch(buildSupabaseEndpoint("earnings_posts", "select=id"), {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ticker: input.ticker,
      company_name: input.company_name,
      title: input.title,
      summary: input.summary,
      short_summary: input.short_summary,
      continuation: input.continuation ?? null,
      conclusion: input.conclusion,
      source_url: input.source_url ?? null,
      published_at: input.published_at,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as SupabaseError;
    throw new Error(error.message || "Supabase insert failed.");
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows[0];
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasValidAdminAuth(req)) {
    sendUnauthorized(res);
    return;
  }

  if (req.method !== "POST") {
    sendMethodNotAllowed(res, ["POST"]);
    return;
  }

  let parsedBody: unknown;
  try {
    parsedBody = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "JSONのparseに失敗しました。" });
    return;
  }

  const validation = validateEarningsPostInput(parsedBody);
  if (!validation.ok) {
    sendJson(res, 400, { error: validation.errors.join("\n") });
    return;
  }

  try {
    const duplicate = await findDuplicate(validation.value);
    if (duplicate) {
      sendJson(res, 409, { error: "同じ銘柄・公開日・タイトルの投稿が既に登録されています。" });
      return;
    }

    const row = await insertPost(validation.value);
    sendJson(res, 201, { message: "登録しました", id: row?.id });
  } catch (error) {
    console.error("Admin earnings insert failed", error);
    sendJson(res, 500, { error: "登録処理に失敗しました。環境変数またはSupabase設定を確認してください。" });
  }
}
