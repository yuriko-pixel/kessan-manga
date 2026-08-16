import type { Expectation, PriceReaction, RatingLevel } from "../types";

type Props = {
  label: string;
  value: RatingLevel | Expectation | PriceReaction;
};

const labels: Record<string, string> = {
  strong: "強い",
  neutral: "普通",
  weak: "弱い",
  beat: "上振れ",
  inline: "想定線",
  miss: "未達",
  up: "上昇",
  flat: "横ばい",
  down: "下落",
};

export default function RatingBadge({ label, value }: Props) {
  return (
    <div className={`rating-card rating-${value}`}>
      <span>{label}</span>
      <strong>{labels[value]}</strong>
    </div>
  );
}
