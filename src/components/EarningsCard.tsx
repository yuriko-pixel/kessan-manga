import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { Earnings } from "../types";
import EarningsTags from "./EarningsTags";
import MiniCharacter from "./MiniCharacter";

export default function EarningsCard({ item }: { item: Earnings }) {
  const pts = item.pts;
  const isPositive = (pts?.changePercent ?? 0) >= 0;

  return (
    <Link className="earnings-card" to={`/stocks/${item.code}`}>
      <div className="card-main">
        <div className="stock-meta">
          <strong>{item.code}</strong>
          <span>{item.companyName}</span>
        </div>
        <h2>{item.headline}</h2>
        {pts && (
          <div className={`pts-pill ${isPositive ? "positive" : "negative"}`}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            PTS {pts.changePercent > 0 ? "+" : ""}
            {pts.changePercent.toFixed(2)}%
          </div>
        )}
        <EarningsTags tags={item.tags} />
        <div className="card-foot">
          <span>{item.sector}</span>
          <span>
            <Clock size={15} />
            {item.announcedAt}
          </span>
        </div>
      </div>
      <div className="card-art">
        <MiniCharacter mood={isPositive ? "happy" : "shocked"} large />
        <span className="caption">{item.category}</span>
      </div>
    </Link>
  );
}
