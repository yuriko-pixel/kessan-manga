export type RatingLevel = "strong" | "neutral" | "weak";
export type Expectation = "beat" | "inline" | "miss";
export type PriceReaction = "up" | "flat" | "down";

export type FinancialMetric = {
  value: number;
  yoy: number;
};

export type MangaPanel = {
  title: string;
  speaker?: string;
  dialogue: string;
  mood: "happy" | "confident" | "neutral" | "angry" | "shocked";
};

export type Earnings = {
  code: string;
  companyName: string;
  sector: string;
  announcedAt: string;
  category: string;
  attentionScore: number;
  headline: string;
  shortHeadline: string;
  summary: string;
  points: string[];
  tags: string[];
  ratings: {
    earnings: RatingLevel;
    outlook: RatingLevel;
    marketExpectation: Expectation;
    priceReaction: PriceReaction;
  };
  results: {
    revenue: FinancialMetric;
    operatingProfit: FinancialMetric;
    ordinaryProfit?: FinancialMetric;
    netProfit: FinancialMetric;
    orders?: FinancialMetric;
  };
  forecast?: {
    revenue?: FinancialMetric;
    operatingProfit?: FinancialMetric;
  };
  dividend?: {
    value: number;
    difference: number;
  };
  pts?: {
    price: number;
    change: number;
    changePercent: number;
    previousClose: number;
    sparkline: number[];
  };
  manga: MangaPanel[];
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
