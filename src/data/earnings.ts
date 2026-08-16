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

const metric = (value: unknown) => {
  const data = asRecord(value);
  return {
    value: Number(data.value ?? 0),
    yoy: Number(data.yoy ?? 0),
  };
};

const optionalMetric = (value: unknown) => {
  if (!value) return undefined;
  return metric(value);
};

const normalizeEarnings = (row: RawRecord): Earnings => {
  const ratings = asRecord(pick(row, "ratings", "ratings", {}));
  const results = asRecord(pick(row, "results", "results", {}));
  const forecast = asRecord(pick(row, "forecast", "forecast", undefined));
  const dividend = asRecord(pick(row, "dividend", "dividend", undefined));
  const pts = asRecord(pick(row, "pts", "pts", undefined));

  return {
    code: String(pick(row, "code", "code", "")),
    companyName: String(pick(row, "companyName", "company_name", "")),
    sector: String(pick(row, "sector", "sector", "")),
    announcedAt: String(pick(row, "announcedAt", "announced_at", "")),
    category: String(pick(row, "category", "category", "")),
    attentionScore: Number(pick(row, "attentionScore", "attention_score", 0)),
    headline: String(pick(row, "headline", "headline", "")),
    shortHeadline: String(pick(row, "shortHeadline", "short_headline", "")),
    summary: String(pick(row, "summary", "summary", "")),
    points: textArray(pick(row, "points", "points", [])),
    tags: textArray(pick(row, "tags", "tags", [])),
    ratings: {
      earnings: String(ratings.earnings ?? "neutral") as RatingLevel,
      outlook: String(ratings.outlook ?? "neutral") as RatingLevel,
      marketExpectation: String(ratings.marketExpectation ?? ratings.market_expectation ?? "inline") as Expectation,
      priceReaction: String(ratings.priceReaction ?? ratings.price_reaction ?? "flat") as PriceReaction,
    },
    results: {
      revenue: metric(results.revenue),
      operatingProfit: metric(results.operatingProfit ?? results.operating_profit),
      ordinaryProfit: optionalMetric(results.ordinaryProfit ?? results.ordinary_profit),
      netProfit: metric(results.netProfit ?? results.net_profit),
      orders: optionalMetric(results.orders),
    },
    forecast: forecast && Object.keys(forecast).length
      ? {
          revenue: optionalMetric(forecast.revenue),
          operatingProfit: optionalMetric(forecast.operatingProfit ?? forecast.operating_profit),
        }
      : undefined,
    dividend: dividend && Object.keys(dividend).length
      ? {
          value: Number(dividend.value ?? 0),
          difference: Number(dividend.difference ?? 0),
        }
      : undefined,
    pts: pts && Object.keys(pts).length
      ? {
          price: Number(pts.price ?? 0),
          change: Number(pts.change ?? 0),
          changePercent: Number(pts.changePercent ?? pts.change_percent ?? 0),
          previousClose: Number(pts.previousClose ?? pts.previous_close ?? 0),
          sparkline: numberArray(pts.sparkline),
        }
      : undefined,
    manga: Array.isArray(row.manga) ? (row.manga as MangaPanel[]) : [],
  };
};

export async function fetchEarnings() {
  const rows = await supabaseSelect<RawRecord[]>("earnings", "select=*");
  return rows.map(normalizeEarnings);
}

export async function fetchEarningsByCode(code: string) {
  const rows = await supabaseSelect<RawRecord[]>("earnings", `select=*&code=eq.${encodeURIComponent(code)}&limit=1`);
  return rows[0] ? normalizeEarnings(rows[0]) : undefined;
}
