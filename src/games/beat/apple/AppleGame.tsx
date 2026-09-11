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

/** 一张餐桌：圆桌贴图 + 桌边小动物 + 桌上餐盘 */
function TableShell({
  friendIndex,
  label,
  done,
  tableIndex,
  children,
}: {
  friendIndex: number;
  label: string;
  done?: boolean;
  tableIndex?: number;
  children: ReactNode;
}) {
  return (
    <div className={`apple-bar${done ? " done" : ""}`} data-table={tableIndex}>
      <div className="apple-table">
        <div className="table-kid">
          <img src={tableFriend(friendIndex)} alt="" draggable={false} />
        </div>
        <img className="table-img" src={TABLE_IMG} alt="" draggable={false} />
        {children}
      </div>
      <div className="apple-bar-label">{label}</div>
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
  const barsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag>({ active: false, type: null, clone: null, pointerId: null });

  const changeTs = (label: string, b: number) => {
    if (dragRef.current.active) return;
    setTs(label);
    setBeats(b);
    setTables(emptyAppleTables(b));
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
      const plates = barsRef.current?.querySelectorAll<HTMLElement>(".apple-plates[data-plates] .apple-plate");
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
        addApple(type, Number(plateEl.dataset.table), Number(plateEl.dataset.plate));
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

  const onTrayPointerDown = (type: AppleNoteType, e: React.PointerEvent) => {
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
  let msg = "";
  if (doneCount === 4) {
    msg = '🎉 太棒了！所有小朋友都端走了餐盘！<span class="en">Perfect!</span>';
  } else if (doneCount > 0) {
    msg = `👏 已有 ${doneCount} 个小朋友端走餐盘，继续！<span class="en">${doneCount}/4</span>`;
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
              <div className="apple-card" key={type}>
                <AppleIcon type={type} />
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
          if (!el) return;
          removeApple(Number(el.dataset.table), Number(el.dataset.plate), Number(el.dataset.idx));
        }}
      >
        {!isEighth && (
          <>
            <TableShell friendIndex={0} label="第 1 小节（看看）">
              <div className="apple-plates">
                {Array.from({ length: beats }).map((_, p) => (
                  <Plate
                    key={p}
                    items={p === 0 ? ["whole"] : []}
                    scale={scale}
                    beatsText={p === 0 ? "1 拍" : "待填"}
                  />
                ))}
              </div>
            </TableShell>
            <TableShell friendIndex={1} label="第 2 小节（看看）">
              <div className="apple-plates">
                {Array.from({ length: beats }).map((_, p) => (
                  <Plate
                    key={p}
                    items={p === 0 ? ["half", "half"] : []}
                    scale={scale}
                    beatsText={p === 0 ? "半拍 ×2" : "待填"}
                  />
                ))}
              </div>
            </TableShell>
          </>
        )}
        {tables.map((plates, t) => (
          <TableShell
            key={t}
            friendIndex={t + 2}
            label={`第 ${t + 3} 小节（你来放）`}
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
      <div className="apple-tray">
        <span className="apple-tray-label">🎵 把苹果拖到餐盘里（点餐盘里的苹果可拿出）：</span>
        {(Object.keys(APPLE_NOTES) as AppleNoteType[]).map((type) => {
          const n = APPLE_NOTES[type];
          return (
            <div key={type} className="apple-item" onPointerDown={(e) => onTrayPointerDown(type, e)}>
              <AppleIcon type={type} />
              <span className="ai-name">{n.name}</span>
              <span className="ai-beats">{beatLabel(n.beats * scale)}</span>
            </div>
          );
        })}
      </div>
      <div className="apple-msg" dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
}
