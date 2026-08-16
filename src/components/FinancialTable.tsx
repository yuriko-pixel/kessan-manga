import type { Earnings, FinancialMetric } from "../types";

const formatMetric = (metric?: FinancialMetric) => {
  if (!metric) return "-";
  return `${metric.value.toLocaleString()}億円`;
};

const formatYoy = (metric?: FinancialMetric) => {
  if (!metric) return "-";
  return `${metric.yoy > 0 ? "+" : ""}${metric.yoy.toFixed(1)}%`;
};

function Row({ label, metric }: { label: string; metric?: FinancialMetric }) {
  const className = metric && metric.yoy >= 0 ? "price-up" : "price-down";
  return (
    <tr>
      <th>{label}</th>
      <td>{formatMetric(metric)}</td>
      <td className={metric ? className : ""}>{formatYoy(metric)}</td>
    </tr>
  );
}

export default function FinancialTable({ item }: { item: Earnings }) {
  return (
    <div className="financial-section">
      <section className="data-card">
        <h3>今回実績</h3>
        <table className="financial-table">
          <tbody>
            <Row label="売上高" metric={item.results.revenue} />
            <Row label="営業利益" metric={item.results.operatingProfit} />
            <Row label="経常利益" metric={item.results.ordinaryProfit} />
            <Row label="純利益" metric={item.results.netProfit} />
            <Row label="受注高" metric={item.results.orders} />
          </tbody>
        </table>
      </section>
      <section className="data-card">
        <h3>来期予想</h3>
        <table className="financial-table">
          <tbody>
            <Row label="売上高" metric={item.forecast?.revenue} />
            <Row label="営業利益" metric={item.forecast?.operatingProfit} />
          </tbody>
        </table>
      </section>
      <section className="data-card">
        <h3>配当</h3>
        {item.dividend ? (
          <div className="dividend-box">
            <span>年間配当予想</span>
            <strong>{item.dividend.value.toLocaleString()}円</strong>
            <p className={item.dividend.difference >= 0 ? "price-up" : "price-down"}>
              前期比 {item.dividend.difference > 0 ? "+" : ""}
              {item.dividend.difference.toLocaleString()}円
            </p>
          </div>
        ) : (
          <p className="muted-text">配当予想の発表はありません。</p>
        )}
      </section>
    </div>
  );
}
