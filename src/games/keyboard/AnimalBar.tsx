import { animalData, type AnimalKey } from "./data";

type Props = {
  level: number;
  selected: AnimalKey | null;
  dragging: AnimalKey | null;
  onSelect: (key: AnimalKey) => void;
  onPointerDown: (key: AnimalKey, e: React.PointerEvent) => void;
};

export function AnimalBar({ level, selected, dragging, onSelect, onPointerDown }: Props) {
  const showDragHint = level >= 2;
  return (
    <div className="animal-bar" id="animalBar">
      {(Object.keys(animalData) as AnimalKey[]).map((k) => {
        const data = animalData[k];
        const cls = [
          "animal-item",
          showDragHint ? "draggable-hint" : "",
          selected === k ? "selected" : "",
          dragging === k ? "dragging" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div
            key={k}
            className={cls}
            data-animal={k}
            onClick={() => onSelect(k)}
            onPointerDown={(e) => onPointerDown(k, e)}
          >
            {showDragHint && <span className="drag-badge">拖</span>}
            <img className="animal-avatar" src={data.src} alt={data.name} />
            <span className="animal-name">{data.name}</span>
            <span className="animal-key">
              <strong className="first-letter">{data.letter}</strong>
              {data.en.slice(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
