import { Heart, LogIn, Search, Settings } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="app-header">
      <a className="brand" href="/">
        <span className="brand-mark">決</span>
        <span>
          <strong>決算劇場</strong>
          <small>決算を、3秒で理解。</small>
        </span>
      </a>
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <input placeholder="銘柄名・コードで検索" />
      </label>
      <div className="header-actions">
        <button aria-label="お気に入り" title="お気に入り">
          <Heart size={19} />
        </button>
        <button aria-label="設定" title="設定">
          <Settings size={19} />
        </button>
        <button className="login-button">
          <LogIn size={17} />
          ログイン
        </button>
      </div>
    </header>
  );
}
