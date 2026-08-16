import type { Earnings } from "../types";
import EarningsCard from "./EarningsCard";
import EmptyState from "./EmptyState";

export default function EarningsFeed({ items }: { items: Earnings[] }) {
  if (!items.length) return <EmptyState message="該当する決算はまだありません。" />;

  return (
    <div className="feed-list">
      {items.map((item) => (
        <EarningsCard item={item} key={item.code} />
      ))}
    </div>
  );
}
