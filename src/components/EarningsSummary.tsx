import type { Earnings } from "../types";

export default function EarningsSummary({ item }: { item: Earnings }) {
  return (
    <section className="summary-block">
      <h3>30秒でわかる要約</h3>
      <p>{item.summary}</p>
      <div className="point-box">
        <h4>重要ポイント</h4>
        <ul>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
