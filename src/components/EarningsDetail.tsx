import { FileText, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import type { Earnings } from "../types";
import EarningsSummary from "./EarningsSummary";
import EarningsTags from "./EarningsTags";
import FinancialTable from "./FinancialTable";
import MangaPanels from "./MangaPanels";
import PtsCard from "./PtsCard";
import RatingBadge from "./RatingBadge";

const tabs = ["要約", "漫画で見る", "数字で確認", "原文・資料"] as const;
type Tab = (typeof tabs)[number];

export default function EarningsDetail({ item }: { item: Earnings }) {
  const [activeTab, setActiveTab] = useState<Tab>("要約");
  const [favorite, setFavorite] = useState(false);

  const tabContent = useMemo(() => {
    if (activeTab === "要約") return <EarningsSummary item={item} />;
    if (activeTab === "漫画で見る") return <MangaPanels panels={item.manga} />;
    if (activeTab === "数字で確認") return <FinancialTable item={item} />;
    return <SourceCards />;
  }, [activeTab, item]);

  return (
    <div className="detail-layout">
      <section className="detail-main">
        <div className="detail-top">
          <div>
            <div className="stock-meta detail-meta">
              <strong>{item.code}</strong>
              <span>{item.companyName}</span>
            </div>
            <h1>{item.headline.replace("…", "にされる件ww")}</h1>
            <EarningsTags tags={item.tags} />
          </div>
          <button
            className={`favorite-button ${favorite ? "selected" : ""}`}
            aria-label="銘柄をお気に入り"
            onClick={() => setFavorite((value) => !value)}
          >
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            お気に入り
          </button>
        </div>

        <div className="rating-grid">
          <RatingBadge label="業績" value={item.ratings.earnings} />
          <RatingBadge label="来期見通し" value={item.ratings.outlook} />
          <RatingBadge label="市場期待" value={item.ratings.marketExpectation} />
          <RatingBadge label="PTS反応" value={item.ratings.priceReaction} />
        </div>

        <div className="tab-bar" role="tablist" aria-label="決算詳細タブ">
          {tabs.map((tab) => (
            <button className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)} key={tab}>
              {tab}
            </button>
          ))}
        </div>
        <div className="tab-panel">{tabContent}</div>
      </section>
      <aside className="detail-side">
        <PtsCard item={item} />
      </aside>
    </div>
  );
}

function SourceCards() {
  const sources = ["決算短信 PDF", "決算説明資料 PDF", "業績予想修正", "TDnet適時開示"];
  return (
    <div className="source-grid">
      {sources.map((source) => (
        <a className="source-card" href="#" key={source}>
          <FileText size={22} />
          <span>{source}</span>
          <small>原文を確認</small>
        </a>
      ))}
    </div>
  );
}
