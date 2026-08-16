import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import EarningsTags from "../components/EarningsTags";
import { useEarnings } from "../hooks/useEarnings";

const rankingTabs = ["注目度", "PTS上昇率", "PTS下落率", "増配", "最高益", "好決算なのに下落"] as const;
type RankingTab = (typeof rankingTabs)[number];

export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>("注目度");
  const { items: earnings, isLoading, error } = useEarnings();
  const ranked = useMemo(() => {
    const items = [...earnings];
    if (tab === "PTS上昇率") return items.filter((item) => (item.pts?.changePercent ?? 0) > 0).sort((a, b) => (b.pts?.changePercent ?? 0) - (a.pts?.changePercent ?? 0));
    if (tab === "PTS下落率") return items.filter((item) => (item.pts?.changePercent ?? 0) < 0).sort((a, b) => (a.pts?.changePercent ?? 0) - (b.pts?.changePercent ?? 0));
    if (tab === "増配") return items.filter((item) => item.tags.includes("増配")).sort((a, b) => (b.dividend?.difference ?? 0) - (a.dividend?.difference ?? 0));
    if (tab === "最高益") return items.filter((item) => item.tags.some((tag) => tag.includes("最高益")));
    if (tab === "好決算なのに下落") return items.filter((item) => item.category === "好決算なのに下落");
    return items.sort((a, b) => b.attentionScore - a.attentionScore);
  }, [earnings, tab]);

  return (
    <section>
      <div className="page-title-row">
        <div>
          <p className="section-kicker">Ranking</p>
          <h1>注目ランキング</h1>
        </div>
      </div>
      <div className="filter-bar wide">
        {rankingTabs.map((item) => (
          <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
      {isLoading ? (
        <EmptyState message="Supabaseからランキングを読み込んでいます。" />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <div className="ranking-list">
          {ranked.map((item, index) => (
            <Link className="ranking-card" to={`/stocks/${item.code}`} key={item.code}>
              <div className="rank-number">{index + 1}</div>
              <div className="ranking-main">
                <div className="stock-meta">
                  <strong>{item.code}</strong>
                  <span>{item.companyName}</span>
                </div>
                <h2>{item.shortHeadline}</h2>
                <EarningsTags tags={item.tags.slice(0, 3)} />
              </div>
              <div className={(item.pts?.changePercent ?? 0) >= 0 ? "rank-pts price-up" : "rank-pts price-down"}>
                {item.pts?.changePercent && item.pts.changePercent > 0 ? "+" : ""}
                {item.pts?.changePercent.toFixed(2)}%
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
