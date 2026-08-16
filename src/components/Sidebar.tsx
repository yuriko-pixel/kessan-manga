import { CalendarDays, ChartNoAxesColumnIncreasing, Clapperboard, Heart, Home, ListChecks, Star } from "lucide-react";
import { NavLink } from "react-router-dom";

const primary = [
  { to: "/", label: "ホーム", icon: Home },
  { to: "/today", label: "本日の決算", icon: ListChecks },
  { to: "/ranking", label: "注目ランキング", icon: ChartNoAxesColumnIncreasing },
  { to: "/manga", label: "漫画で見る決算", icon: Clapperboard },
];

const categories = ["神決算", "増配・自社株買い", "最高益更新", "好決算なのに下落", "下方修正・悪化", "赤字転落・黒字転換", "決算延期・その他"];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="nav-section">
        {primary.map(({ to, label, icon: Icon }) => (
          <NavLink key={label} to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-section">
        <p className="nav-title">カテゴリ</p>
        {categories.map((category) => (
          <a className="category-link" href={`/?category=${encodeURIComponent(category)}`} key={category}>
            {category}
          </a>
        ))}
      </div>
      <div className="nav-section sidebar-bottom">
        <a className="nav-link muted" href="#">
          <CalendarDays size={18} />
          決算カレンダー
        </a>
        <a className="nav-link muted" href="#">
          <Heart size={18} />
          お気に入り
        </a>
        <a className="nav-link muted" href="#">
          <Star size={18} />
          比較リスト
        </a>
      </div>
    </aside>
  );
}
