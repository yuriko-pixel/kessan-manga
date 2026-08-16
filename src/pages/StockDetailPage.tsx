import { Link, useParams } from "react-router-dom";
import EarningsDetail from "../components/EarningsDetail";
import EmptyState from "../components/EmptyState";
import { getEarningsByCode } from "../data/earnings";

export default function StockDetailPage() {
  const { code = "" } = useParams();
  const item = getEarningsByCode(code);

  if (!item) {
    return (
      <>
        <EmptyState message="指定された銘柄の決算データが見つかりません。" />
        <Link className="text-link" to="/">
          一覧へ戻る
        </Link>
      </>
    );
  }

  return <EarningsDetail item={item} />;
}
