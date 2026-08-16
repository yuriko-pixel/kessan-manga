import type { MangaPanel } from "../types";
import MiniCharacter from "./MiniCharacter";

export default function MangaPanels({ panels }: { panels: MangaPanel[] }) {
  return (
    <div className="manga-grid">
      {panels.map((panel, index) => (
        <article className={`manga-panel panel-${index + 1}`} key={panel.title}>
          <div className="panel-title">{panel.title}</div>
          <div className="panel-scene">
            <MiniCharacter mood={panel.mood} />
            <div className="speech-bubble">
              {panel.speaker && <span>{panel.speaker}</span>}
              <p>{panel.dialogue}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
