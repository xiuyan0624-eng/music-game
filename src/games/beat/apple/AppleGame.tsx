import { useEffect, useRef, useState } from "react";
import { useApp } from "../../../context/AppContext";
import {
  APPLE_NOTES,
  emptyAppleTables,
  plateSum,
  TABLE_KIDS,
  tableDone,
  type AppleNoteType,
  type AppleTables,
} from "./logic";

const PLATE_TARGET = 1;

type Drag = {
  active: boolean;
  type: AppleNoteType | null;
  clone: HTMLDivElement | null;
  pointerId: number | null;
};

export function AppleGame() {
  const { audio } = useApp();
  const [tables, setTables] = useState<AppleTables>(() => emptyAppleTables());
  const barsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag>({ active: false, type: null, clone: null, pointerId: null });

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
    d.clone.innerHTML = APPLE_NOTES[type].svg;
    document.body.appendChild(d.clone);
    d.clone.style.left = `${e.clientX}px`;
    d.clone.style.top = `${e.clientY}px`;
  };

  let doneCount = 0;
  tables.forEach((plates) => {
    if (tableDone(plates, PLATE_TARGET)) doneCount += 1;
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
        <div className="apple-ts">
          四二拍 2/4 <span className="en">2 beats per bar</span>
        </div>
        <div className="apple-knowledge">
          {(Object.keys(APPLE_NOTES) as AppleNoteType[]).map((type) => {
            const n = APPLE_NOTES[type];
            return (
              <div className="apple-card" key={type}>
                <span dangerouslySetInnerHTML={{ __html: n.svg }} />
                <span className="ac-name">{n.name}</span>
                <span className="ac-beats">{type === "whole" ? "四分音符 = 一拍" : "八分音符 = 半拍"}</span>
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
        <div className="apple-bar">
          <div className="table-kid">{TABLE_KIDS[0]}</div>
          <div className="apple-bar-label">第 1 小节（看看）</div>
          <div className="apple-plates">
            <div className="apple-plate demo">
              <div className="plate-content">
                <span className="plate-item" dangerouslySetInnerHTML={{ __html: APPLE_NOTES.whole.svg }} />
              </div>
              <span className="plate-beats">1 拍</span>
            </div>
            <div className="apple-plate demo">
              <div className="plate-content">
                <span className="plate-empty">空盘</span>
              </div>
              <span className="plate-beats">待填</span>
            </div>
          </div>
        </div>
        <div className="apple-bar">
          <div className="table-kid">{TABLE_KIDS[1]}</div>
          <div className="apple-bar-label">第 2 小节（看看）</div>
          <div className="apple-plates">
            <div className="apple-plate demo">
              <div className="plate-content">
                <span className="plate-item" dangerouslySetInnerHTML={{ __html: APPLE_NOTES.half.svg }} />
              </div>
              <span className="plate-beats">半拍</span>
            </div>
            <div className="apple-plate demo">
              <div className="plate-content">
                <span className="plate-item" dangerouslySetInnerHTML={{ __html: APPLE_NOTES.half.svg }} />
              </div>
              <span className="plate-beats">半拍</span>
            </div>
          </div>
        </div>
        {tables.map((plates, t) => (
          <div key={t} className={`apple-bar${tableDone(plates, PLATE_TARGET) ? " done" : ""}`} data-table={t}>
            <div className="table-kid">{TABLE_KIDS[t + 2]}</div>
            <div className="apple-bar-label">第 {t + 3} 小节（你来放）</div>
            <div className="apple-plates" data-plates={t}>
              {plates.map((items, p) => {
                const sum = plateSum(items);
                const statusClass = sum === PLATE_TARGET ? " correct" : sum > PLATE_TARGET ? " wrong" : "";
                return (
                  <div key={p} className={`apple-plate${statusClass}`} data-table={t} data-plate={p}>
                    <div className="plate-content">
                      {items.length === 0 ? (
                        <span className="plate-empty">空盘</span>
                      ) : (
                        items.map((type, ni) => (
                          <span
                            key={`${type}-${ni}`}
                            className="plate-item"
                            data-table={t}
                            data-plate={p}
                            data-idx={ni}
                            dangerouslySetInnerHTML={{ __html: APPLE_NOTES[type].svg }}
                          />
                        ))
                      )}
                    </div>
                    <span className="plate-beats">
                      {sum}/{PLATE_TARGET} 拍
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="apple-tray">
        <span className="apple-tray-label">🎵 把苹果拖到餐盘里（点餐盘里的苹果可拿出）：</span>
        {(Object.keys(APPLE_NOTES) as AppleNoteType[]).map((type) => {
          const n = APPLE_NOTES[type];
          return (
            <div key={type} className="apple-item" onPointerDown={(e) => onTrayPointerDown(type, e)}>
              <span dangerouslySetInnerHTML={{ __html: n.svg }} />
              <span className="ai-name">{n.name}</span>
              <span className="ai-beats">{n.label}</span>
            </div>
          );
        })}
      </div>
      <div className="apple-msg" dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
}
