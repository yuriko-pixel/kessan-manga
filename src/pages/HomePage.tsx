import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import EarningsFeed from "../components/EarningsFeed";
import { useEarnings } from "../hooks/useEarnings";

const filters = ["すべて", "注目順", "時間順", "PTS変動率順"] as const;
type Filter = (typeof filters)[number];
const weekdays = ["日", "月", "火", "水", "木", "金", "土"] as const;

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("すべて");
  const { items: earnings, isLoading, error } = useEarnings();
  const today = new Date();
  const todayLabel = `${today.getMonth() + 1}/${today.getDate()}（${weekdays[today.getDay()]}）`;

  const sorted = useMemo(() => {
    const items = [...earnings];
    if (filter === "注目順") return items.sort((a, b) => b.attentionScore - a.attentionScore);
    if (filter === "時間順") return items.sort((a, b) => a.announcedAt.localeCompare(b.announcedAt));
    if (filter === "PTS変動率順") return items.sort((a, b) => Math.abs(b.pts?.changePercent ?? 0) - Math.abs(a.pts?.changePercent ?? 0));
    return items;
  }, [earnings, filter]);

  const topItem = sorted[0];
  const notableDown = earnings.find((item) => (item.pts?.changePercent ?? 0) < 0);

  return (
    <div className="page-grid">
      <section>
        <div className="page-title-row">
          <div>
            <p className="section-kicker">Today's earnings</p>
            <h1>本日の決算</h1>
          </div>
          <div className="date-chip">
            <strong>{todayLabel}</strong>
            <span>発表{earnings.length}社</span>
          </div>
        </div>
        <div className="filter-bar">
          {filters.map((item) => (
            <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>
              {item}
            </button>
          ))}
        </div>
        {isLoading ? (
          <EmptyState message="Supabaseから決算データを読み込んでいます。" />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <EarningsFeed items={sorted} />
        )}
      </section>
      <aside className="right-rail">
        <div className="rail-block">
          <p className="section-kicker">Market mood</p>
          <h2>{topItem ? `${topItem.companyName}に注目` : "決算データを待機中"}</h2>
          <p>{topItem ? topItem.summary : "Supabaseから取得した決算データをもとに、注目銘柄を表示します。"}</p>
        </div>
        <div className="rail-block alert">
          <p className="section-kicker">注目</p>
          <h2>{notableDown?.category ?? "PTS反応"}</h2>
          <p>{notableDown ? notableDown.shortHeadline : "PTSの反応が大きい銘柄があればここに表示します。"}</p>
        </div>
      </aside>
    </div>
  );
}
