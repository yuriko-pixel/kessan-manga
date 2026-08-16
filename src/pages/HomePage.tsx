import { useMemo, useState } from "react";
import { earnings } from "../data/earnings";
import EarningsFeed from "../components/EarningsFeed";

const filters = ["すべて", "注目順", "時間順", "PTS変動率順"] as const;
type Filter = (typeof filters)[number];

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("すべて");

  const sorted = useMemo(() => {
    const items = [...earnings];
    if (filter === "注目順") return items.sort((a, b) => b.attentionScore - a.attentionScore);
    if (filter === "時間順") return items.sort((a, b) => a.announcedAt.localeCompare(b.announcedAt));
    if (filter === "PTS変動率順") return items.sort((a, b) => Math.abs(b.pts?.changePercent ?? 0) - Math.abs(a.pts?.changePercent ?? 0));
    return items;
  }, [filter]);

  return (
    <div className="page-grid">
      <section>
        <div className="page-title-row">
          <div>
            <p className="section-kicker">Today's earnings</p>
            <h1>本日の決算</h1>
          </div>
          <div className="date-chip">
            <strong>5/14（火）</strong>
            <span>発表48社</span>
          </div>
        </div>
        <div className="filter-bar">
          {filters.map((item) => (
            <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>
              {item}
            </button>
          ))}
        </div>
        <EarningsFeed items={sorted} />
      </section>
      <aside className="right-rail">
        <div className="rail-block">
          <p className="section-kicker">Market mood</p>
          <h2>今日は期待値との勝負</h2>
          <p>好決算でも、事前期待が高すぎる銘柄は売られています。数字そのものより、市場が何を織り込んでいたかが焦点です。</p>
        </div>
        <div className="rail-block alert">
          <p className="section-kicker">注目</p>
          <h2>好決算なのに下落</h2>
          <p>レーザーテックは受注回復と増配を出しつつ、コンセンサス未達でPTS急落。</p>
        </div>
      </aside>
    </div>
  );
}
