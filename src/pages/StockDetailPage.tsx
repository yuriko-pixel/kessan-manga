import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EarningsDetail from "../components/EarningsDetail";
import EmptyState from "../components/EmptyState";
import { fetchEarningsByCode } from "../data/earnings";
import type { Earnings } from "../types";

export default function StockDetailPage() {
  const { code = "" } = useParams();
  const [item, setItem] = useState<Earnings | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    fetchEarningsByCode(code)
      .then((result) => {
        if (isActive) setItem(result);
      })
      .catch((fetchError: unknown) => {
        if (isActive) setError(fetchError instanceof Error ? fetchError.message : "Supabaseからの取得に失敗しました。");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [code]);

  if (isLoading) {
    return <EmptyState message="Supabaseから銘柄データを読み込んでいます。" />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

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
