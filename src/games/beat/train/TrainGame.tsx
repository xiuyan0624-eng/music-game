import { useEffect, useRef, useState } from "react";
import { useApp } from "../../../context/AppContext";
import {
  CARRIAGE_IMGS,
  carriageSum,
  emptyCarriages,
  TIME_SIGS,
  TRAIN_ENGINE_IMGS,
  TRAIN_NOTES,
  trainColorIndex,
  trainStatus,
  type TrainNoteKey,
} from "./logic";

type Drag = {
  active: boolean;
  type: TrainNoteKey | null;
  clone: HTMLDivElement | null;
  pointerId: number | null;
};

/** 车头贴图 + 车厢侧面的拍号车牌 */
function Engine({ ts, colorIdx }: { ts: string; colorIdx: number }) {
  return (
    <div className="engine-wrap">
      <img className="engine-img" src={TRAIN_ENGINE_IMGS[colorIdx]} alt="火车头" draggable={false} />
      <span className="engine-plate">{ts}</span>
    </div>
  );
}

export function TrainGame() {
  const { audio } = useApp();
  const [ts, setTs] = useState("2/4");
  const [beatsPerBar, setBeatsPerBar] = useState(2);
  const [carriages, setCarriages] = useState<TrainNoteKey[][]>(() => emptyCarriages());
  const [msg, setMsg] = useState("");
  const [going, setGoing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag>({ active: false, type: null, clone: null, pointerId: null });
  const winLock = useRef(false);

  const addNote = (type: TrainNoteKey, index: number) => {
    setCarriages((prev) => {
      const next = prev.map((row) => [...row]);
      next[index].push(type);
      return next;
    });
    audio.playBeep(660, 0.08);
  };

  const removeNote = (ci: number, ni: number) => {
    setCarriages((prev) => {
      const next = prev.map((row) => [...row]);
      next[ci].splice(ni, 1);
      return next;
    });
  };

  useEffect(() => {
    const { allCorrect, allFilled } = trainStatus(carriages, beatsPerBar);
    if (allCorrect && allFilled) {
      if (winLock.current) return;
      winLock.current = true;
      setMsg('🎉 太棒了！每个小节都装对了，火车开动啦！<span class="en">All correct! Choo-choo!</span>');
      audio.playBeep(233, 0.28);
      window.setTimeout(() => audio.playBeep(196, 0.32), 420);
      setGoing(true);
      window.setTimeout(() => {
        setGoing(false);
        setCarriages(emptyCarriages());
        setMsg("");
        winLock.current = false;
      }, 2400);
    } else if (allFilled) {
      setMsg(
        '🤔 有些车厢拍数不对，点车厢里的音符可以拿出来重放 <span class="en">Some cars are wrong — tap a note to remove it</span>',
      );
    } else if (!winLock.current) {
      setMsg("");
    }
  }, [audio, beatsPerBar, carriages]);

  useEffect(() => {
    const carriageAtPoint = (x: number, y: number) => {
      const list = boxRef.current?.querySelectorAll<HTMLElement>(".carriage");
      if (!list) return null;
      for (const c of list) {
        const r = c.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return c;
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
      const el = carriageAtPoint(e.clientX, e.clientY);
      d.clone?.remove();
      const type = d.type;
      d.clone = null;
      d.active = false;
      d.type = null;
      d.pointerId = null;
      if (el && type) addNote(type, Number(el.dataset.carriage));
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

  const onTrayDown = (type: TrainNoteKey, e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.active) return;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    d.active = true;
    d.type = type;
    d.pointerId = e.pointerId;
    d.clone = document.createElement("div");
    d.clone.className = "note-drag-clone";
    d.clone.innerHTML = TRAIN_NOTES[type].svg;
    document.body.appendChild(d.clone);
    d.clone.style.left = `${e.clientX}px`;
    d.clone.style.top = `${e.clientY}px`;
  };

  const colorIdx = trainColorIndex(ts);

  return (
    <div>
      <div className="train-ts">
        {TIME_SIGS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`ts-btn${item.label === ts ? " active" : ""}`}
            onClick={() => {
              if (dragRef.current.active) return;
              setTs(item.label);
              setBeatsPerBar(item.beats);
              setCarriages(emptyCarriages());
              setMsg("");
              winLock.current = false;
            }}
          >
            {item.label} 拍
          </button>
        ))}
      </div>
      <div className="train-scroll">
        <div
          className={`train${going ? " train-go" : ""}`}
          ref={boxRef}
          onClick={(e) => {
            const noteEl = (e.target as HTMLElement).closest<HTMLElement>(".carriage-note");
            if (!noteEl) return;
            removeNote(Number(noteEl.dataset.carriage), Number(noteEl.dataset.noteidx));
          }}
        >
          <div className="train-engine">
            <Engine ts={ts} colorIdx={colorIdx} />
          </div>
          {carriages.map((notes, i) => {
            const sum = carriageSum(notes);
            const statusClass = sum === beatsPerBar ? " correct" : sum > beatsPerBar ? " wrong" : "";
            return (
              <div key={i} style={{ display: "contents" }}>
                <div className="bar-link">
                  <span className="link-line" />
                  <span className="link-label">小节</span>
                  <span className="link-line" />
                </div>
                <div className="carriage" data-carriage={i}>
                  <div className={`carriage-body${statusClass}`}>
                    <img className="carriage-img" src={CARRIAGE_IMGS[colorIdx]} alt="" draggable={false} />
                    <div className="carriage-notes">
                      {notes.map((type, ni) => (
                        <span
                          key={`${type}-${ni}`}
                          className="carriage-note"
                          data-carriage={i}
                          data-noteidx={ni}
                          dangerouslySetInnerHTML={{ __html: TRAIN_NOTES[type].svg }}
                        />
                      ))}
                    </div>
                    <div className="carriage-count">
                      {sum}/{beatsPerBar} 拍
                    </div>
                    {statusClass === " correct" && <span className="carriage-badge ok">✓</span>}
                    {statusClass === " wrong" && <span className="carriage-badge no">✗</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="train-end">
            <div className="end-lines">
              <span className="end-line" />
              <span className="end-line thick" />
            </div>
            <span className="end-label">终止线</span>
          </div>
        </div>
      </div>
      <div className="note-tray">
        <span className="note-tray-label">🎵 把音符拖进车厢（点车厢里的音符可拿出）：</span>
        {(Object.keys(TRAIN_NOTES) as TrainNoteKey[]).map((type) => {
          const n = TRAIN_NOTES[type];
          return (
            <div key={type} className="note-item" onPointerDown={(e) => onTrayDown(type, e)}>
              <span dangerouslySetInnerHTML={{ __html: n.svg }} />
              <span className="note-name">{n.name}</span>
              <span className="note-beats">{n.beats} 拍</span>
            </div>
          );
        })}
      </div>
      <div className="train-msg" dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
}
