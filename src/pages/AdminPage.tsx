import { AlertCircle, CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { EarningsPostInput } from "../types";

type ParseResult =
  | { ok: true; value: EarningsPostInput }
  | { ok: false; errors: string[] };

const sampleJson = `{
  "ticker": "8746",
  "company_name": "unbanked",
  "title": "前社長との泥沼バトルで本当に銀行が使えなくなった件",
  "summary": [
    "7月17日に前社長を解職",
    "前社長側が現社長の職務執行停止を申し立て",
    "主要銀行の口座から出金できない状態に",
    "金地金事業の取引を停止"
  ],
  "short_summary": "社名がunbankedなのに、本当に銀行口座が使えなくなるという強烈な伏線回収。",
  "continuation": [
    "会社側は口座凍結解除を銀行と交渉中",
    "東京地裁の判断を待っている"
  ],
  "conclusion": "お家騒動の結果、主力事業まで止まる異例の展開。",
  "source_url": "https://example.com/ir.pdf",
  "published_at": "2026-08-21"
}`;

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

function validatePost(value: unknown): ParseResult {
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

  if (errors.length > 0) {
    return { ok: false, errors };
  }

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

function parseInput(text: string): ParseResult | null {
  if (!text.trim()) return null;

  try {
    return validatePost(JSON.parse(text));
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? `JSON parse error: ${error.message}` : "JSONのparseに失敗しました。"],
    };
  }
}

export default function AdminPage() {
  const [rawJson, setRawJson] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          setAuthState("error");
          return;
        }
        setAuthState("ok");
      })
      .catch(() => {
        setAuthState("error");
      });
  }, []);

  const parsed = useMemo(() => parseInput(rawJson), [rawJson]);
  const preview = parsed?.ok ? parsed.value : null;

  const errors = parsed && !parsed.ok ? parsed.errors : [];
  const canSubmit = Boolean(preview && !isSubmitting && authState === "ok");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview) return;

    setIsSubmitting(true);
    setMessage(null);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || `登録に失敗しました。（${response.status}）`);
      }

      setRawJson("");
      setMessage(payload.message || "登録しました");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-page">
      <div className="page-title-row">
        <div>
          <p className="section-kicker">Admin</p>
          <h1>投稿登録</h1>
        </div>
        <div className="date-chip">
          <strong>JSON登録</strong>
          <span>Supabaseへ保存</span>
        </div>
      </div>

      {authState === "checking" ? (
        <div className="admin-alert">
          <ShieldCheck size={18} />
          <span>管理APIの認証を確認しています。</span>
        </div>
      ) : authState === "error" ? (
        <div className="admin-alert error" role="alert">
          <AlertCircle size={18} />
          <span>管理画面の認証が必要です。直接 /admin を開き直してBasic認証を通してください。</span>
        </div>
      ) : (
        <div className="admin-alert success">
          <ShieldCheck size={18} />
          <span>管理APIの認証を確認しました。</span>
        </div>
      )}

      {message && (
        <div className="admin-alert success" role="status">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}
      {submitError && (
        <div className="admin-alert error" role="alert">
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form className="admin-editor" onSubmit={handleSubmit}>
        <label htmlFor="earnings-json">投稿JSON</label>
        <textarea
          id="earnings-json"
          value={rawJson}
          onChange={(event) => {
            setRawJson(event.target.value);
            setMessage(null);
            setSubmitError(null);
          }}
          placeholder={sampleJson}
          spellCheck={false}
        />

        {errors.length > 0 && (
          <div className="admin-errors" role="alert">
            <strong>入力エラー</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {preview && (
          <article className="admin-preview">
            <div className="stock-meta">
              <strong>{preview.company_name}</strong>
              <span>{preview.ticker}</span>
              <span>{preview.published_at}</span>
            </div>
            <h2>{preview.title}</h2>

            <div className="admin-preview-section">
              <h3>summary</h3>
              <ul>
                {preview.summary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="admin-preview-section">
              <h3>小まとめ</h3>
              <p>{preview.short_summary}</p>
            </div>

            {preview.continuation && preview.continuation.length > 0 && (
              <div className="admin-preview-section">
                <h3>つづき</h3>
                <ul>
                  {preview.continuation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="admin-preview-section">
              <h3>結論</h3>
              <p>{preview.conclusion}</p>
            </div>

            <div className="admin-preview-footer">
              <span>公開日: {preview.published_at}</span>
              <span>source URL: {preview.source_url || "なし"}</span>
            </div>
          </article>
        )}

        <button className="admin-submit" type="submit" disabled={!canSubmit}>
          <Send size={18} />
          {isSubmitting ? "登録中" : "登録する"}
        </button>
      </form>
    </section>
  );
}
