import { useEffect, useState } from "react";
import { fetchEarnings } from "../data/earnings";
import type { Earnings } from "../types";

type EarningsState = {
  items: Earnings[];
  isLoading: boolean;
  error: string | null;
};

export function useEarnings(): EarningsState {
  const [state, setState] = useState<EarningsState>({
    items: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    fetchEarnings()
      .then((items) => {
        if (isActive) setState({ items, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            items: [],
            isLoading: false,
            error: error instanceof Error ? error.message : "Supabaseからの取得に失敗しました。",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
