import { En } from "../../ui/En";
import { BackButton } from "../../ui/BackButton";
import { TabBar } from "../../ui/TabBar";
import { useApp } from "../../context/AppContext";
import { animalData, NOTE_LABEL, songList, type AnimalKey, type NoteName } from "./data";
import { AnimalBar } from "./AnimalBar";
import { PianoKeyboard } from "./PianoKeyboard";
import { useKeyboardGame, type KbLevel } from "./useKeyboardGame";
import { useEffect, useRef, useState } from "react";

type Props = { visible: boolean };

export function KeyboardGame({ visible }: Props) {
  const { goHome } = useApp();
  const kb = useKeyboardGame(visible);
  const kbRef = useRef(kb);
  kbRef.current = kb;
  const drag = useRef<{
    animal: AnimalKey | null;
    clone: HTMLDivElement | null;
    startX: number;
    startY: number;
    active: boolean;
    pointerId: number | null;
  }>({ animal: null, clone: null, startX: 0, startY: 0, active: false, pointerId: null });

  const [ghostPos, setGhostPos] = useState<{ left: number; top: number; opacity: number } | null>(null);

  useEffect(() => {
    if (!kb.demoGhost) {
      setGhostPos(null);
      return;
    }
    const from = kb.demoGhost.from;
    const to = kb.demoGhost.to;
    setGhostPos({ left: from.left + from.width / 2, top: from.top + from.height / 2, opacity: 0.85 });
    const id = requestAnimationFrame(() => {
      setGhostPos({ left: to.left + to.width / 2, top: to.top + to.height / 2, opacity: 0.85 });
    });
    const fade = window.setTimeout(() => setGhostPos((p) => (p ? { ...p, opacity: 0 } : p)), 1000);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(fade);
    };
  }, [kb.demoGhost]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      const api = kbRef.current;
      if (!d.animal || e.pointerId !== d.pointerId) return;
      if (!d.active) {
        if (Math.abs(e.clientX - d.startX) < 10 && Math.abs(e.clientY - d.startY) < 10) return;
        d.active = true;
        d.clone = document.createElement("div");
        d.clone.style.cssText = "position:fixed;z-index:9999;pointer-events:none;transform:translate(-50%,-50%);";
        d.clone.innerHTML = `<img class="animal-avatar" src="${animalData[d.animal].src}" alt="">`;
        document.body.appendChild(d.clone);
        api.setDragging(d.animal);
      }
      if (d.clone) {
        d.clone.style.left = `${e.clientX}px`;
        d.clone.style.top = `${e.clientY}px`;
      }
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      const d = drag.current;
      const api = kbRef.current;
      if (!d.animal || e.pointerId !== d.pointerId) return;
      if (d.active && d.clone) {
        const hit = api.keyAtPoint(e.clientX, e.clientY);
        d.clone.remove();
        d.clone = null;
        api.setDragging(null);
        if (hit) api.handlePlace(d.animal, hit.name, hit.el);
        else api.onMissedDrop();
      }
      d.animal = null;
      d.active = false;
      d.pointerId = null;
    };
    const onCancel = (e: PointerEvent) => {
      const d = drag.current;
      const api = kbRef.current;
      if (!d.animal || e.pointerId !== d.pointerId) return;
      d.clone?.remove();
      d.clone = null;
      api.setDragging(null);
      d.animal = null;
      d.active = false;
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
  }, []);

  const onAnimalPointerDown = (key: AnimalKey, e: React.PointerEvent) => {
    const d = drag.current;
    if (d.animal !== null) return;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    d.animal = key;
    d.pointerId = e.pointerId;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.active = false;
  };

  const song = songList[kb.songIndex];
  const segment = song.segments[kb.segmentIndex];

  return (
    <div className="panel active" style={{ display: visible ? "block" : "none" }}>
      <div className="sub-nav">
        <BackButton onClick={goHome}>← 项目</BackButton>
        <span className="sub-nav-title">🐸 我是谁？</span>
      </div>
      <TabBar
        buttonClass="level-tab"
        activeId={String(kb.level)}
        onChange={(id) => kb.switchLevel(Number(id) as KbLevel)}
        items={[
          { id: "1", label: <>认识音名 <En>Learn Notes</En></> },
          { id: "2", label: <>帮我找位置 <En>Find Position</En></> },
          { id: "3", label: <>旋律游戏 <En>Melody Game</En></> },
          { id: "4", label: <>小作曲家 <En>Compose</En></> },
        ]}
      />

      <div id="kbTaskArea">
        <div className="song-select" style={{ display: kb.level === 3 ? "flex" : "none" }}>
          {songList.map((s, i) => (
            <button
              key={s.name}
              type="button"
              className={`song-btn${i === kb.songIndex ? " active" : ""}`}
              onClick={() => kb.selectSong(i)}
            >
              {s.name}
              <En>{s.enName}</En>
            </button>
          ))}
        </div>
        <div
          className="progress"
          style={{ display: kb.level === 4 ? "none" : undefined }}
          dangerouslySetInnerHTML={{ __html: kb.progressHtml }}
        />
        <div
          className="task-box"
          style={{ display: kb.level === 4 ? "none" : undefined }}
          dangerouslySetInnerHTML={{ __html: kb.taskHtml }}
        />
        <div
          className="drag-guide"
          style={{ display: kb.level === 4 ? "none" : undefined }}
          dangerouslySetInnerHTML={{ __html: kb.guideHtml }}
        />
        <div className="melody-row" style={{ display: kb.level === 3 ? "flex" : "none" }}>
          {segment.map((note, index) => {
            const flash = kb.melodyFlash;
            const current = flash ? index === flash.current : index === kb.taskIndex;
            const done = flash ? index < flash.doneUntil : index < kb.taskIndex;
            return (
              <div key={`${note}-${index}`} className={`melody-note${current ? " current" : done ? " done" : ""}`}>
                {note === "C4" ? "C" : note}
              </div>
            );
          })}
        </div>
        {kb.level !== 4 && (
          <AnimalBar
            level={kb.level}
            selected={kb.selectedAnimal}
            dragging={kb.dragging}
            onSelect={kb.onAnimalSelect}
            onPointerDown={onAnimalPointerDown}
          />
        )}
        {kb.level === 4 && (
          <div id="composeArea">
            <div className="compose-bars">
              <span className="compose-label">选择小节数：</span>
              {[4, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`compose-bar-btn${kb.composeBars === n ? " active" : ""}`}
                  onClick={() => kb.changeBars(n)}
                >
                  {n} 小节
                </button>
              ))}
            </div>
            <div className="compose-grid">
              {Array.from({ length: kb.composeBars }, (_, bar) => (
                <div className="compose-bar" key={bar}>
                  <div className="compose-bar-label">第 {bar + 1} 小节</div>
                  <div className="compose-bar-row">
                    {Array.from({ length: 4 }, (_, beat) => {
                      const idx = bar * 4 + beat;
                      const note = kb.composeNotes[idx];
                      const cls = [
                        "compose-cell",
                        note ? "filled" : "",
                        idx === kb.composeCursor ? "cursor" : "",
                        kb.playingCell === idx ? "playing" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={cls}
                          onClick={() => {
                            if (kb.composePlaying) return;
                            kb.setComposeCursor(idx);
                          }}
                        >
                          {note ? NOTE_LABEL[note as NoteName] : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="compose-controls">
              <button type="button" className="compose-btn" onClick={kb.composeBack}>
                ← 后退
              </button>
              <button type="button" className="compose-btn" onClick={kb.composeClear}>
                清空
              </button>
              <button type="button" className="compose-btn compose-play" onClick={kb.composePlay}>
                ▶ AI 演奏
              </button>
            </div>
            <div className="compose-status" dangerouslySetInnerHTML={{ __html: kb.composeStatus }} />
          </div>
        )}
      </div>

      <PianoKeyboard
        showAnimals={kb.level === 4}
        keyFx={kb.keyFx}
        setKeyEl={kb.setKeyEl}
        onKeyClick={kb.onKeyClick}
      />
      <div className="keyboard-tip" dangerouslySetInnerHTML={{ __html: kb.tipHtml }} />
      <div className="success-msg" dangerouslySetInnerHTML={{ __html: kb.messageHtml }} />

      {kb.dropFeedback && (
        <div
          className="key-drop-feedback"
          style={{ position: "fixed", left: kb.dropFeedback.x, top: kb.dropFeedback.y }}
        >
          <img className="animal-avatar" src={animalData[kb.dropFeedback.animal].src} alt="" />
        </div>
      )}
      {kb.demoGhost && ghostPos && (
        <div
          className="drag-demo-ghost"
          style={{
            left: ghostPos.left,
            top: ghostPos.top,
            transform: "translate(-50%, -50%)",
            opacity: ghostPos.opacity,
          }}
        >
          <img className="animal-avatar" src={animalData[kb.demoGhost.animal].src} alt="" />
        </div>
      )}
    </div>
  );
}
