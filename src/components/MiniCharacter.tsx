import type { MangaPanel } from "../types";

export default function MiniCharacter({ mood = "neutral", large = false }: { mood?: MangaPanel["mood"]; large?: boolean }) {
  return (
    <div className={`mini-character mood-${mood} ${large ? "large" : ""}`} aria-hidden="true">
      <div className="face">
        <span className="eye left" />
        <span className="eye right" />
        <span className="mouth" />
      </div>
      <div className="body" />
    </div>
  );
}
