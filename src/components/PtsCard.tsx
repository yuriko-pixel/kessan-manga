import type { Earnings } from "../types";

const buildPath = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 54 - ((value - min) / range) * 42;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

export default function PtsCard({ item }: { item: Earnings }) {
  if (!item.pts) return null;

  const isPositive = item.pts.changePercent >= 0;
  const path = buildPath(item.pts.sparkline);

  return (
    <section className="pts-card">
      <div>
        <span className="section-kicker">PTS株価</span>
        <strong className="pts-price">{item.pts.price.toLocaleString()}円</strong>
        <p className={isPositive ? "price-up" : "price-down"}>
          {item.pts.change > 0 ? "+" : ""}
          {item.pts.change.toLocaleString()}円 / {item.pts.changePercent > 0 ? "+" : ""}
          {item.pts.changePercent.toFixed(2)}%
        </p>
        <small>前日終値 {item.pts.previousClose.toLocaleString()}円</small>
      </div>
      <svg className="sparkline" viewBox="0 0 100 64" role="img" aria-label="PTSの簡易チャート">
        <path className="sparkline-grid" d="M0 54H100 M0 33H100 M0 12H100" />
        <path className={isPositive ? "sparkline-up" : "sparkline-down"} d={path} />
      </svg>
    </section>
  );
}
