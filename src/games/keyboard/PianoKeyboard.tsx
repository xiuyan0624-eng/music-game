import { BLACK_KEYS_X, KEY_ANIMALS, WHITE_KEYS, animalData, type NoteName } from "./data";

type KeyFx = { fill: string; cls: string };

type Props = {
  showAnimals: boolean;
  keyFx: Record<NoteName, KeyFx>;
  setKeyEl: (note: NoteName, el: SVGRectElement | null) => void;
  onKeyClick: (note: NoteName) => void;
};

export function PianoKeyboard({ showAnimals, keyFx, setKeyEl, onKeyClick }: Props) {
  return (
    <div className="keyboard-wrap">
      <svg
        id="keyboardSvg"
        className={showAnimals ? "show-animals" : undefined}
        viewBox="0 0 560 180"
        style={{ width: "100%", height: "auto" }}
      >
        {WHITE_KEYS.map((k) => (
          <rect
            key={k.key}
            x={k.x}
            y={20}
            width={70}
            height={140}
            rx={4}
            className={`key-white ${keyFx[k.key].cls}`.trim()}
            data-key={k.key}
            fill={keyFx[k.key].fill}
            stroke="#211b1c"
            strokeWidth={3}
            ref={(el) => setKeyEl(k.key, el)}
            onClick={() => onKeyClick(k.key)}
          />
        ))}
        {BLACK_KEYS_X.map((x) => (
          <rect key={x} x={x} y={20} width={45} height={85} rx={5} fill="#211b1c" />
        ))}
        {KEY_ANIMALS.map((item) => (
          <foreignObject key={item.animal} className="key-animal" data-animal={item.animal} x={item.x} y={106} width={50} height={46}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img className="animal-avatar" src={animalData[item.animal].src} alt="" />
            </div>
          </foreignObject>
        ))}
        {WHITE_KEYS.map((k) => (
          <text
            key={`label-${k.key}`}
            x={k.labelX}
            y={175}
            fontSize={k.labelSize}
            fontWeight={k.key === "C4" ? "bold" : undefined}
            fill={k.labelFill}
            textAnchor="middle"
          >
            {k.key === "C4" ? "C" : k.key}
          </text>
        ))}
      </svg>
    </div>
  );
}
