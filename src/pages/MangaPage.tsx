import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MangaPanels from "../components/MangaPanels";
import { useEarnings } from "../hooks/useEarnings";

export default function MangaPage() {
  const { items: earnings, isLoading, error } = useEarnings();

  return (
    <section>
      <div className="page-title-row">
        <div>
          <p className="section-kicker">Manga digest</p>
          <h1>漫画で見る決算</h1>
        </div>
      </div>
      {isLoading ? (
        <EmptyState message="Supabaseから漫画データを読み込んでいます。" />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <div className="manga-wall">
          {earnings
            .filter((item) => item.attentionScore >= 85)
            .map((item) => (
              <Link className="manga-card" to={`/stocks/${item.code}`} key={item.code}>
                <div className="stock-meta">
                  <strong>{item.code}</strong>
                  <span>{item.companyName}</span>
                </div>
                <h2>{item.shortHeadline}</h2>
                <MangaPanels panels={item.manga.slice(0, 2)} />
              </Link>
            ))}
        </div>
      )}
    </section>
  );
}
