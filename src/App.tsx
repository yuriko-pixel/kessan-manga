import { Navigate, Route, Routes } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import StockDetailPage from "./pages/StockDetailPage";
import RankingPage from "./pages/RankingPage";
import MangaPage from "./pages/MangaPage";

export default function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/today" element={<HomePage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/manga" element={<MangaPage />} />
            <Route path="/stocks/:code" element={<StockDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
