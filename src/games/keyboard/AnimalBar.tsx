import { animalData, ORDERED_ANIMALS, type AnimalKey } from "./data";

type Props = {
  level: number;
  selected: AnimalKey | null;
  dragging: AnimalKey | null;
  /** 动物排列顺序（「帮我找位置」里会打乱） */
  order?: AnimalKey[];
  onSelect: (key: AnimalKey) => void;
  onPointerDown: (key: AnimalKey, e: React.PointerEvent) => void;
};

export function AnimalBar({ level, selected, dragging, order, onSelect, onPointerDown }: Props) {
  const showDragHint = level >= 2;
  const keys = order ?? ORDERED_ANIMALS;
  return (
    <div className="animal-bar" id="animalBar">
      {keys.map((k) => {
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
