import { useEffect } from "react";
import { En } from "../../ui/En";
import { BackButton } from "../../ui/BackButton";
import { TabBar } from "../../ui/TabBar";
import { useApp } from "../../context/AppContext";
import { AppleGame, APPLE_PRELOAD } from "./apple/AppleGame";
import { TrainGame, TRAIN_PRELOAD } from "./train/TrainGame";
import { BeatDisplay } from "./BeatDisplay";
import { useBeatGame, type BeatStage } from "./useBeatGame";

export function BeatGame() {
  const { goHome } = useApp();
  const { stage, loadStage, question, showQuiz, messageHtml, pressed, wrong, handleKey } = useBeatGame();

  // 进入「节拍游戏」时静默预加载贴图，避免切到小游戏时图片还在下载
  useEffect(() => {
    [...TRAIN_PRELOAD, ...APPLE_PRELOAD].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="panel active">
      <div className="sub-nav">
        <BackButton onClick={goHome}>← 项目</BackButton>
        <span className="sub-nav-title">🎵 节拍游戏</span>
      </div>
      <TabBar
        buttonClass="stage-btn"
        activeId={stage}
        onChange={(id) => loadStage(id as BeatStage)}
        items={[
          { id: "learn", label: <>认识时值 <En>Learn Values</En></> },
          { id: "random", label: <>排排走 <En>Random Order</En></> },
          { id: "apple", label: <>分拍小苹果 <En>Apple Beats</En></> },
          { id: "train", label: <>拍号小火车 <En>Train</En></> },
        ]}
      />
      {showQuiz && question && (
        <>
          <div className="level-info">{question.groupLabel}</div>
          <BeatDisplay
            noteKey={question.noteKey}
            groupNotes={question.groupNotes}
            noteIndex={question.noteIndex}
          />
          <div className="beat-keys">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                className={`beat-key${pressed.includes(n) ? " pressed" : ""}${wrong === n ? " wrong" : ""}`}
                onClick={() => handleKey(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}
      {stage === "apple" && <AppleGame />}
      {stage === "train" && <TrainGame />}
      {showQuiz && <div className="beat-message" dangerouslySetInnerHTML={{ __html: messageHtml }} />}
    </div>
  );
}
