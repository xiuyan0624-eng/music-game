import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  applyBeatTap,
  beatNotePool,
  buildLearnQuestions,
  buildRandomGroupQuestions,
  type BeatQuestion,
  type NoteKey,
} from "./logic";

export type BeatStage = "learn" | "random" | "apple" | "train";

export function useBeatGame() {
  const { audio } = useApp();
  const [stage, setStage] = useState<BeatStage>("learn");
  const [questions, setQuestions] = useState<BeatQuestion[]>(() => buildLearnQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [messageHtml, setMessageHtml] = useState("");
  const [pressed, setPressed] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetKeys = () => {
    setPressed([]);
    setWrong(null);
  };

  const loadStage = useCallback((next: BeatStage) => {
    clearTimer();
    setStage(next);
    setMessageHtml("");
    resetKeys();
    setBusy(false);
    setTapCount(0);
    setCurrentIndex(0);
    if (next === "learn") setQuestions(buildLearnQuestions());
    else if (next === "random") setQuestions(buildRandomGroupQuestions());
  }, []);

  useEffect(() => () => clearTimer(), []);

  const renderReset = useCallback(() => {
    setTapCount(0);
    setBusy(false);
    resetKeys();
    setMessageHtml("");
  }, []);

  const handleKey = useCallback(
    (n: number) => {
      if (busy || !questions.length || stage === "apple" || stage === "train") return;
      const q = questions[currentIndex];
      const note = beatNotePool[q.noteKey];
      const result = applyBeatTap(tapCount, n, note.taps, currentIndex, questions);
      if (result.kind === "wrong-order") {
        setBusy(true);
        setMessageHtml(
          `❌ 顺序不对，下一个应是 ${result.expected} <span class="en">Wrong — next is ${result.expected}</span>`,
        );
        audio.playBeep(200, 0.3);
        setWrong(n);
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          setCurrentIndex((i) => i);
          renderReset();
        }, 800);
        return;
      }
      setTapCount(result.tapCount);
      audio.playBeep(600, 0.1);
      if (result.tapCount <= note.taps) audio.speakNumber(result.tapCount);
      setPressed((prev) => (prev.includes(n) ? prev : [...prev, n]));
      if (result.kind === "tap") return;
      setBusy(true);
      audio.playBeep(880, 0.2);
      const delay = result.outcome === "all" ? 1500 : 1000;
      if (result.outcome === "all") {
        setMessageHtml('🎉 全部完成！<span class="en">All done!</span>');
      } else if (result.outcome === "group") {
        setMessageHtml('🎉 本组完成！<span class="en">Group completed!</span>');
      } else {
        setMessageHtml('✅ 过关！<span class="en">Great!</span>');
      }
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (result.outcome === "all") setCurrentIndex(0);
        else setCurrentIndex((i) => i + 1);
        renderReset();
      }, delay);
    },
    [audio, busy, currentIndex, questions, renderReset, stage, tapCount],
  );

  const question = questions[currentIndex];
  const showQuiz = stage === "learn" || stage === "random";

  return {
    stage,
    loadStage,
    question,
    showQuiz,
    messageHtml,
    pressed,
    wrong,
    handleKey,
    noteOf: (key: NoteKey) => beatNotePool[key],
  };
}
