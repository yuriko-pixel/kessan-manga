import type { Earnings, Expectation, MangaPanel, PriceReaction, RatingLevel } from "../types";
import { supabaseSelect } from "../lib/supabase";

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord => (value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : {});

const pick = <T>(row: RawRecord, camelKey: string, snakeKey: string, fallback: T): T => {
  const value = row[camelKey] ?? row[snakeKey];
  return value === undefined || value === null ? fallback : (value as T);
};

const textArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

const numberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) return value.map(Number).filter((item) => Number.isFinite(item));
  return [];
};

const toNumber = (value: unknown): number => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const metric = (value: unknown) => {
  const data = asRecord(value);
  return {
    value: toNumber(data.value),
    yoy: toNumber(data.yoy),
  };
};

const optionalMetric = (value: unknown) => {
  if (!value) return undefined;
  return metric(value);
};

const viewMetric = (row: RawRecord, valueKey: string, yoyKey: string) => ({
  value: toNumber(row[valueKey]),
  yoy: toNumber(row[yoyKey]),
});

const optionalViewMetric = (row: RawRecord, valueKey: string, yoyKey: string) => {
  const value = row[valueKey];
  const yoy = row[yoyKey];
  if (value === undefined && yoy === undefined) return undefined;
  return viewMetric(row, valueKey, yoyKey);
};

const dividendFromRow = (row: RawRecord) => {
  const dividend = row.dividend;
  const previousDividend = row.previous_dividend;
  if (dividend === undefined && previousDividend === undefined) return undefined;
  const value = toNumber(dividend);
  return {
    value,
    difference: value - toNumber(previousDividend),
  };
};

const fallbackHeadline = (row: RawRecord, companyName: string) => {
  const headline = String(pick(row, "headline", "headline", ""));
  if (headline) return headline;
  return companyName ? `${companyName}の決算` : "決算情報";
};

const attentionScore = (row: RawRecord, tags: string[]) => {
  const explicit = pick(row, "attentionScore", "attention_score", undefined);
  if (explicit !== undefined) return toNumber(explicit);
  return Math.max(
    Math.abs(toNumber(row.operating_profit_yoy)),
    Math.abs(toNumber(row.orders_yoy)),
    Math.abs(toNumber(row.forecast_revenue_yoy)),
    tags.length * 10,
  );
};

const normalizeEarnings = (row: RawRecord): Earnings => {
  const ratings = asRecord(pick(row, "ratings", "ratings", {}));
  const results = asRecord(pick(row, "results", "results", {}));
  const forecast = asRecord(pick(row, "forecast", "forecast", undefined));
  const dividend = asRecord(pick(row, "dividend", "dividend", undefined));
  const pts = asRecord(pick(row, "pts", "pts", undefined));
  const tags = textArray(pick(row, "tags", "tags", []));
  const highlights = textArray(pick(row, "points", "highlights", []));
  const companyName = String(pick(row, "companyName", "company_name", ""));
  const headline = fallbackHeadline(row, companyName);
  const shortSummary = String(pick(row, "shortHeadline", "short_summary", ""));
  const viewDividend = dividendFromRow(row);

  return {
    code: String(pick(row, "code", "code", "")),
    companyName,
    sector: String(pick(row, "sector", "sector", "")),
    announcedAt: String(pick(row, "announcedAt", "announced_at", "")),
    category: String(pick(row, "category", "headline_type", tags[0] ?? "")),
    attentionScore: attentionScore(row, tags),
    headline,
    shortHeadline: shortSummary || headline,
    summary: String(pick(row, "summary", "summary", shortSummary || headline)),
    points: highlights.length ? highlights : tags,
    tags,
    ratings: {
      earnings: String(ratings.earnings ?? row.earnings_rating ?? "neutral") as RatingLevel,
      outlook: String(ratings.outlook ?? row.outlook_rating ?? "neutral") as RatingLevel,
      marketExpectation: String(ratings.marketExpectation ?? ratings.market_expectation ?? "inline") as Expectation,
      priceReaction: String(ratings.priceReaction ?? ratings.price_reaction ?? "flat") as PriceReaction,
    },
    results: {
      revenue: results.revenue ? metric(results.revenue) : viewMetric(row, "revenue", "revenue_yoy"),
      operatingProfit: results.operatingProfit || results.operating_profit
        ? metric(results.operatingProfit ?? results.operating_profit)
        : viewMetric(row, "operating_profit", "operating_profit_yoy"),
      ordinaryProfit: optionalMetric(results.ordinaryProfit ?? results.ordinary_profit),
      netProfit: results.netProfit || results.net_profit
        ? metric(results.netProfit ?? results.net_profit)
        : viewMetric(row, "net_profit", "net_profit_yoy"),
      orders: optionalMetric(results.orders) ?? optionalViewMetric(row, "orders", "orders_yoy"),
    },
    forecast: forecast && Object.keys(forecast).length
      ? {
          revenue: optionalMetric(forecast.revenue),
          operatingProfit: optionalMetric(forecast.operatingProfit ?? forecast.operating_profit),
        }
      : row.forecast_revenue_yoy !== undefined || row.forecast_operating_profit_yoy !== undefined
        ? {
            revenue: optionalViewMetric(row, "forecast_revenue", "forecast_revenue_yoy"),
            operatingProfit: optionalViewMetric(row, "forecast_operating_profit", "forecast_operating_profit_yoy"),
          }
      : undefined,
    dividend: dividend && Object.keys(dividend).length
      ? {
          value: toNumber(dividend.value),
          difference: toNumber(dividend.difference),
        }
      : viewDividend,
    pts: pts && Object.keys(pts).length
      ? {
          price: toNumber(pts.price),
          change: toNumber(pts.change),
          changePercent: toNumber(pts.changePercent ?? pts.change_percent),
          previousClose: toNumber(pts.previousClose ?? pts.previous_close),
          sparkline: numberArray(pts.sparkline),
        }
      : undefined,
    manga: Array.isArray(row.manga)
      ? (row.manga as MangaPanel[])
      : Array.isArray(row.manga_panels)
        ? (row.manga_panels as MangaPanel[])
        : [],
  };
};

export async function fetchEarnings() {
  const rows = await supabaseSelect<RawRecord[]>("earnings_feed", "select=*&order=announced_at.desc");
  return rows.map(normalizeEarnings);
}

export async function fetchEarningsByCode(code: string) {
  const rows = await supabaseSelect<RawRecord[]>("earnings_feed", `select=*&code=eq.${encodeURIComponent(code)}&order=announced_at.desc&limit=1`);
  return rows[0] ? normalizeEarnings(rows[0]) : undefined;
}
