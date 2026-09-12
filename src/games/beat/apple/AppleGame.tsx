import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "../../../context/AppContext";
import {
  APPLE_NOTES,
  PLATE_IMG,
  TABLE_IMG,
  emptyAppleTables,
  plateSum,
  tableFriend,
  tableDone,
  TIME_SIGS,
  type AppleNoteType,
  type AppleTables,
} from "./logic";

const PLATE_TARGET = 1;

/** 进入节拍游戏时预加载的贴图 */
export const APPLE_PRELOAD = [
  APPLE_NOTES.whole.img,
  APPLE_NOTES.half.img,
  APPLE_NOTES.quarter.img,
  TABLE_IMG,
  PLATE_IMG,
];

/** 拍数文字：1 → 一拍，0.5 → 半拍，0.25 → ¼ 拍 */
function beatLabel(beats: number): string {
  if (beats === 1) return "一拍";
  if (beats === 0.5) return "半拍";
  if (beats === 0.25) return "¼ 拍";
  return `${beats} 拍`;
}

/** 苹果贴图（完整 / 半个 / 四分之一） */
function AppleIcon({ type }: { type: AppleNoteType }) {
  return (
    <span className="apple-img">
      <img src={APPLE_NOTES[type].img} alt="" draggable={false} />
    </span>
  );
}

function NoteGlyph({ html }: { html: string }) {
  return <span className="ac-note" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** 一张餐桌：圆桌贴图 + 桌边小动物 + 桌上餐盘 */
function TableShell({
  friendIndex,
  label,
  done,
  tableIndex,
  example,
  children,
}: {
  friendIndex: number;
  label: string;
  done?: boolean;
  tableIndex?: number;
  example?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`apple-bar${done ? " done" : ""}${example ? " example" : ""}`}
      data-table={tableIndex}
      aria-label={example ? `示例，${label}，只能看` : undefined}
    >
      <div className="apple-table">
        <div className="table-kid">
          <img src={tableFriend(friendIndex)} alt="" draggable={false} />
        </div>
        <img className="table-img" src={TABLE_IMG} alt="" draggable={false} />
        {children}
      </div>
      <div className="apple-bar-label">
        {example && <span className="apple-example-badge">示例 · 只能看</span>}
        {label}
      </div>
    </div>
  );
}

/** 餐盘：盘贴图 + 盘中苹果（示范盘无 t/p） */
function Plate({
  statusClass = "",
  items,
  t,
  p,
  scale,
  beatsText,
}: {
  statusClass?: string;
  items: AppleNoteType[];
  t?: number;
  p?: number;
  scale: number;
  beatsText?: string;
}) {
  const sum = plateSum(items, scale);
  return (
    <div className={`apple-plate${statusClass}`} data-table={t} data-plate={p}>
      <img className="plate-img" src={PLATE_IMG} alt="" draggable={false} />
      <div className="plate-content">
        {items.length === 0 ? (
          <span className="plate-empty">空盘</span>
        ) : (
          items.map((type, ni) => (
            <span key={`${type}-${ni}`} className="plate-item" data-table={t} data-plate={p} data-idx={ni}>
              <AppleIcon type={type} />
            </span>
          ))
        )}
      </div>
      <span className="plate-beats">{beatsText ?? `${sum}/${PLATE_TARGET} 拍`}</span>
    </div>
  );
}

type Drag = {
  active: boolean;
  type: AppleNoteType | null;
  clone: HTMLDivElement | null;
  pointerId: number | null;
};

export function AppleGame() {
  const { audio } = useApp();
  const [ts, setTs] = useState("2/4");
  const [beats, setBeats] = useState(2);
  const [tables, setTables] = useState<AppleTables>(() => emptyAppleTables(2));
  const [dropHint, setDropHint] = useState("");
  const barsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag>({ active: false, type: null, clone: null, pointerId: null });

  const changeTs = (label: string, b: number) => {
    if (dragRef.current.active) return;
    setTs(label);
    setBeats(b);
    setTables(emptyAppleTables(b));
    setDropHint("");
  };

  const addApple = (type: AppleNoteType, tableIndex: number, plateIndex: number) => {
    setTables((prev) => {
      const next = prev.map((row) => row.map((plate) => [...plate]));
      next[tableIndex][plateIndex].push(type);
      return next;
    });
    audio.playBeep(660, 0.08);
  };

  const removeApple = (ti: number, pi: number, ni: number) => {
    setTables((prev) => {
      const next = prev.map((row) => row.map((plate) => [...plate]));
      next[ti][pi].splice(ni, 1);
      return next;
    });
  };

  useEffect(() => {
    const plateAtPoint = (x: number, y: number) => {
      const plates = barsRef.current?.querySelectorAll<HTMLElement>(".apple-plate");
      if (!plates) return null;
      for (const p of plates) {
        const r = p.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return p;
      }
      return null;
    };
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || e.pointerId !== d.pointerId || !d.clone) return;
      d.clone.style.left = `${e.clientX}px`;
      d.clone.style.top = `${e.clientY}px`;
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || e.pointerId !== d.pointerId) return;
      const plateEl = plateAtPoint(e.clientX, e.clientY);
      d.clone?.remove();
      const type = d.type;
      d.clone = null;
      d.active = false;
      d.type = null;
      d.pointerId = null;
      if (plateEl && type) {
        if (plateEl.closest(".apple-bar.example")) {
          setDropHint("这是例子哦，请放到后面「你来放」的桌子上～");
          return;
        }
        const tableIndex = Number(plateEl.dataset.table);
        const plateIndex = Number(plateEl.dataset.plate);
        if (!Number.isInteger(tableIndex) || !Number.isInteger(plateIndex)) return;
        setDropHint("");
        addApple(type, tableIndex, plateIndex);
      }
    };
    const onCancel = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || e.pointerId !== d.pointerId) return;
      d.clone?.remove();
      d.clone = null;
      d.active = false;
      d.type = null;
      d.pointerId = null;
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onCancel);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
    };
  }, [audio]);

  const onCardPointerDown = (type: AppleNoteType, e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.active) return;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      /* some browsers */
    }
    d.active = true;
    d.type = type;
    d.pointerId = e.pointerId;
    d.clone = document.createElement("div");
    d.clone.className = "apple-drag-clone";
    d.clone.innerHTML = `<span class="apple-img"><img src="${APPLE_NOTES[type].img}" alt="" /></span>`;
    document.body.appendChild(d.clone);
    d.clone.style.left = `${e.clientX}px`;
    d.clone.style.top = `${e.clientY}px`;
  };

  const isEighth = ts.endsWith("/8");
  const scale = isEighth ? 2 : 1;

  let doneCount = 0;
  tables.forEach((plates) => {
    if (tableDone(plates, PLATE_TARGET, scale)) doneCount += 1;
  });
  let msg = dropHint;
  if (!msg) {
    if (doneCount === 4) {
      msg = '🎉 太棒了！所有小朋友都端走了餐盘！<span class="en">Perfect!</span>';
    } else if (doneCount > 0) {
      msg = `👏 已有 ${doneCount} 个小朋友端走餐盘，继续！<span class="en">${doneCount}/4</span>`;
    }
  }

  return (
    <div>
      <div className="apple-top">
        <div className="train-ts">
          {TIME_SIGS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`ts-btn${item.label === ts ? " active" : ""}`}
              onClick={() => changeTs(item.label, item.beats)}
            >
              {item.label} 拍
            </button>
          ))}
        </div>
        <div className="apple-ts">
          {TIME_SIGS.find((x) => x.label === ts)?.cn} {ts} <span className="en">{beats} beats per bar</span>
        </div>
        <div className="apple-knowledge">
          {(Object.keys(APPLE_NOTES) as AppleNoteType[]).map((type) => {
            const n = APPLE_NOTES[type];
            return (
              <div className="apple-card" key={type} onPointerDown={(e) => onCardPointerDown(type, e)}>
                <AppleIcon type={type} />
                <NoteGlyph html={n.noteSvg} />
                <span className="ac-name">{n.name}</span>
                <span className="ac-beats">{n.label.split(" · ")[0]} = {beatLabel(n.beats * scale)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="apple-bars"
        ref={barsRef}
        onClick={(e) => {
          const el = (e.target as HTMLElement).closest<HTMLElement>(".plate-item");
          if (!el || el.closest(".apple-bar.example")) return;
          const tableIndex = Number(el.dataset.table);
          const plateIndex = Number(el.dataset.plate);
          const itemIndex = Number(el.dataset.idx);
          if (!Number.isInteger(tableIndex) || !Number.isInteger(plateIndex) || !Number.isInteger(itemIndex)) return;
          removeApple(tableIndex, plateIndex, itemIndex);
        }}
      >
        {!isEighth && (
          <>
            <TableShell friendIndex={0} label="完整苹果 = 1 拍" example>
              <div className="apple-plates">
                {Array.from({ length: beats }).map((_, p) => (
                  <Plate key={p} items={["whole"]} scale={scale} beatsText="1 拍" />
                ))}
              </div>
            </TableShell>
            <TableShell friendIndex={1} label="半个苹果 ×2 = 1 拍" example>
              <div className="apple-plates">
                {Array.from({ length: beats }).map((_, p) => (
                  <Plate key={p} items={["half", "half"]} scale={scale} beatsText="半拍 ×2" />
                ))}
              </div>
            </TableShell>
            <div className="apple-bars-split" aria-hidden="true">
              <span>你来放</span>
            </div>
          </>
        )}
        {tables.map((plates, t) => (
          <TableShell
            key={t}
            friendIndex={t + 2}
            label={`第 ${t + 1} 小节（你来放）`}
            done={tableDone(plates, PLATE_TARGET, scale)}
            tableIndex={t}
          >
            <div className="apple-plates" data-plates={t}>
              {plates.map((items, p) => {
                const sum = plateSum(items, scale);
                const statusClass = sum === PLATE_TARGET ? " correct" : sum > PLATE_TARGET ? " wrong" : "";
                return <Plate key={p} statusClass={statusClass} items={items} t={t} p={p} scale={scale} />;
              })}
            </div>
          </TableShell>
        ))}
      </div>
      <div className="apple-msg" dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
}
