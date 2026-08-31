import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  animalData,
  keyDisplay,
  MELODY_BEAT_MS,
  NOTE_LABEL,
  noteToTask,
  shuffleTasks,
  songList,
  TASK_POOL,
  type AnimalKey,
  type NoteName,
  type PlaceTask,
} from "./data";

export type KbLevel = 1 | 2 | 3 | 4;

type KeyFx = { fill: string; cls: string };

const DEFAULT_FILL = "#fffdf7";

function emptyKeyFx(): Record<NoteName, KeyFx> {
  return {
    C4: { fill: DEFAULT_FILL, cls: "" },
    D: { fill: DEFAULT_FILL, cls: "" },
    E: { fill: DEFAULT_FILL, cls: "" },
    F: { fill: DEFAULT_FILL, cls: "" },
    G: { fill: DEFAULT_FILL, cls: "" },
    A: { fill: DEFAULT_FILL, cls: "" },
    B: { fill: DEFAULT_FILL, cls: "" },
  };
}

export function useKeyboardGame(visible: boolean) {
  const { audio, registerHomeInterrupt } = useApp();
  const [level, setLevel] = useState<KbLevel>(1);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalKey | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [tasks, setTasks] = useState<PlaceTask[]>(() => [...TASK_POOL]);
  const [songIndex, setSongIndex] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [messageHtml, setMessageHtml] = useState("");
  const [taskHtml, setTaskHtml] = useState("");
  const [progressHtml, setProgressHtml] = useState("");
  const [guideHtml, setGuideHtml] = useState("");
  const [tipHtml, setTipHtml] = useState("点选小动物，再点对应琴键 <span class=\"en\">Select an animal, then tap its key</span>");
  const [keyFx, setKeyFx] = useState(emptyKeyFx);
  const [dragging, setDragging] = useState<AnimalKey | null>(null);
  const [dropFeedback, setDropFeedback] = useState<{ animal: AnimalKey; x: number; y: number } | null>(null);
  const [demoGhost, setDemoGhost] = useState<{ from: DOMRect; to: DOMRect; animal: AnimalKey } | null>(null);
  const [composeBars, setComposeBars] = useState(4);
  const [composeNotes, setComposeNotes] = useState<(NoteName | null)[]>([]);
  const [composeCursor, setComposeCursor] = useState(0);
  const [composePlaying, setComposePlaying] = useState(false);
  const [composeStatus, setComposeStatus] = useState("");
  const [melodyFlash, setMelodyFlash] = useState<{ current: number; doneUntil: number } | null>(null);
  const [playingCell, setPlayingCell] = useState<number | null>(null);

  const busyRef = useRef(false);
  const levelRef = useRef(level);
  const visibleRef = useRef(visible);
  const timers = useRef<number[]>([]);
  const playingFull = useRef(false);
  const playingSegment = useRef(false);
  const composePlayingRef = useRef(false);
  const hasShownDragDemo = useRef(false);
  const selectedRef = useRef<AnimalKey | null>(null);
  const taskIndexRef = useRef(0);
  const tasksRef = useRef(tasks);
  const songIndexRef = useRef(0);
  const segmentIndexRef = useRef(0);
  const keyEls = useRef<Map<NoteName, SVGRectElement>>(new Map());

  levelRef.current = level;
  visibleRef.current = visible;
  busyRef.current = busy;
  selectedRef.current = selectedAnimal;
  taskIndexRef.current = taskIndex;
  tasksRef.current = tasks;
  songIndexRef.current = songIndex;
  segmentIndexRef.current = segmentIndex;
  composePlayingRef.current = composePlaying;

  const kbTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const setKeyEl = (note: NoteName, el: SVGRectElement | null) => {
    if (el) keyEls.current.set(note, el);
    else keyEls.current.delete(note);
  };

  const highlightKey = useCallback((keyName: NoteName | null) => {
    setKeyFx(() => {
      const next = emptyKeyFx();
      if (keyName) next[keyName] = { fill: "#f7c64d", cls: "" };
      return next;
    });
  }, []);

  const dragGuides = (lv: KbLevel) => {
    if (lv === 1) {
      setGuideHtml('👆 先点小动物，再点琴键学习音名 <span class="en">Tap animal, then tap the key</span>');
      setTipHtml('点选小动物，再点对应琴键 <span class="en">Select an animal, then tap its key</span>');
    } else if (lv === 2) {
      setGuideHtml('👆➡️🎹 拖动小动物到琴键上 <span class="en">Drag the animal onto the piano key</span>');
      setTipHtml('把小动物拖到它的琴键上（也可先点选再点琴键） <span class="en">Drag the animal onto its piano key</span>');
    } else {
      setGuideHtml('👆➡️🎹 拖动小动物到琴键上 <span class="en">Drag the animal onto the piano key</span>');
      setTipHtml('把小动物拖到亮起的琴键上（也可先点选再点琴键） <span class="en">Drag onto the lit key</span>');
    }
  };

  const renderLearnTask = (list: PlaceTask[], index: number, lv: KbLevel) => {
    const task = list[index];
    const a = animalData[task.animalKey];
    const keyName = keyDisplay(task.key, true);
    if (lv === 1) {
      setTaskHtml(
        `<span>记住：</span><span class="highlight">${a.name} (${a.en})</span><span>= ${keyName}键</span><span class="en" style="width:100%;">Remember: ${a.en} = ${task.key === "C4" ? "C (Middle C)" : task.key} key</span>`,
      );
      setProgressHtml(
        `第 ${index + 1} / ${list.length} · 认识音名 <span class="en">Question ${index + 1} / ${list.length}</span>`,
      );
    } else {
      setTaskHtml(
        `<span>拖动</span><span class="highlight">${a.name} ${a.en}</span><span>到</span><span class="highlight">${keyName}</span><span>键上</span><span class="en" style="width:100%;">Drag ${a.en} onto ${task.key === "C4" ? "C" : task.key} key</span>`,
      );
      setProgressHtml(
        `第 ${index + 1} / ${list.length} · 帮我找位置 <span class="en">Question ${index + 1} / ${list.length}</span>`,
      );
    }
    dragGuides(lv);
    setMessageHtml("");
    setSelectedAnimal(null);
    setBusy(false);
    highlightKey(null);
  };

  const renderMelodyView = (silent: boolean, sIdx: number, segIdx: number, tIdx: number) => {
    const song = songList[sIdx];
    const currentTask = noteToTask(song.segments[segIdx][tIdx]);
    const a = animalData[currentTask.animalKey];
    const segmentLabel = `第 ${segIdx + 1}/${song.segments.length} 段`;
    const keyLabel = keyDisplay(currentTask.key);
    setTaskHtml(
      `<span>【${song.name}】${segmentLabel}，拖动</span><span class="highlight">${a.name} (${a.en})</span><span>到亮起的琴键上</span><span class="en" style="width:100%;">Song: ${song.enName} · Drag ${a.en} onto ${keyLabel}</span>`,
    );
    setProgressHtml(
      `第 ${tIdx + 1} / ${song.segments[segIdx].length} 个音 · ${segmentLabel} <span class="en">Note ${tIdx + 1} / ${song.segments[segIdx].length} · ${song.enName}</span>`,
    );
    setMelodyFlash({ current: tIdx, doneUntil: tIdx });
    dragGuides(3);
    highlightKey(currentTask.key);
    if (!silent && visibleRef.current) audio.playNote(currentTask.key, 0.3);
    setMessageHtml("");
    setSelectedAnimal(null);
    setBusy(false);
  };

  const playMelodySequence = (
    notes: NoteName[],
    durations: number[],
    onNote: ((note: NoteName, i: number) => void) | null,
    onDone: () => void,
    extraTailMs: number,
  ) => {
    setBusy(true);
    let delay = 0;
    notes.forEach((noteName, i) => {
      const beats = durations[i] || 1;
      const noteDurSec = Math.min(2.0, (beats * MELODY_BEAT_MS) / 1000 * 0.85);
      kbTimeout(() => {
        onNote?.(noteName, i);
        highlightKey(noteName);
        audio.playNote(noteName, noteDurSec);
      }, delay);
      delay += beats * MELODY_BEAT_MS;
    });
    kbTimeout(onDone, delay + extraTailMs);
  };

  const afterSegmentDemo = (silent: boolean) => {
    playingSegment.current = false;
    const sIdx = songIndexRef.current;
    const segIdx = segmentIndexRef.current;
    const song = songList[sIdx];
    if (segIdx + 1 < song.segments.length) {
      const nextSeg = segIdx + 1;
      setSegmentIndex(nextSeg);
      setTaskIndex(0);
      renderMelodyView(silent, sIdx, nextSeg, 0);
      if (!silent) setMessageHtml('✅ 本段完成！进入下一段！<span class="en">Segment done! Next segment!</span>');
    } else if (!silent && visibleRef.current) {
      playFullMelody();
    } else {
      const nextSong = (sIdx + 1) % songList.length;
      setSongIndex(nextSong);
      setSegmentIndex(0);
      setTaskIndex(0);
      renderMelodyView(true, nextSong, 0, 0);
    }
  };

  const playFullMelody = () => {
    const song = songList[songIndexRef.current];
    const durations = song.durationBeats;
    playingFull.current = true;
    setMessageHtml(
      `🎉 太棒了！整首再听一遍《${song.name}》～ <span class="en">Great! Listen to the whole ${song.enName}</span>`,
    );
    playMelodySequence(
      song.notes,
      durations,
      null,
      () => {
        playingFull.current = false;
        const nextSong = (songIndexRef.current + 1) % songList.length;
        setSongIndex(nextSong);
        setSegmentIndex(0);
        setTaskIndex(0);
        setMessageHtml(
          `⭐ 进入下一首：${songList[nextSong].name} <span class="en">Next: ${songList[nextSong].enName}</span>`,
        );
        renderMelodyView(false, nextSong, 0, 0);
      },
      800,
    );
  };

  const playSegmentMelody = () => {
    const song = songList[songIndexRef.current];
    const notes = song.segments[segmentIndexRef.current];
    const start = segmentIndexRef.current * 4;
    const durations = song.durationBeats.slice(start, start + notes.length);
    playingSegment.current = true;
    setMessageHtml('🎵 听一听这一段～ <span class="en">Listen to this part</span>');
    setMelodyFlash({ current: -1, doneUntil: notes.length });
    playMelodySequence(
      notes,
      durations,
      (_n, i) => setMelodyFlash({ current: i, doneUntil: i }),
      () => {
        playingSegment.current = false;
        afterSegmentDemo(false);
      },
      500,
    );
  };

  const showDrop = (animalKey: AnimalKey, keyEl: Element) => {
    const rect = keyEl.getBoundingClientRect();
    setDropFeedback({ animal: animalKey, x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.35 });
    kbTimeout(() => setDropFeedback(null), 700);
  };

  const currentTask = (): PlaceTask => {
    if (levelRef.current === 3) {
      const song = songList[songIndexRef.current];
      return noteToTask(song.segments[segmentIndexRef.current][taskIndexRef.current]);
    }
    return tasksRef.current[taskIndexRef.current];
  };

  const handlePlace = (animalKey: AnimalKey, keyName: NoteName, keyEl: SVGRectElement) => {
    if (busyRef.current) return;
    const task = currentTask();
    const a = animalData[animalKey];
    const target = animalData[task.animalKey];
    const keyLabel = keyDisplay(task.key);
    if (animalKey !== task.animalKey) {
      setMessageHtml(
        `❌ 动物不对：不是${a.name}，要找${target.name} <span class="en">Wrong animal: find ${target.en}</span>`,
      );
      setKeyFx((prev) => ({ ...prev, [keyName]: { fill: prev[keyName].fill, cls: "shake" } }));
      audio.playBeep(200, 0.25);
      kbTimeout(() => setKeyFx((prev) => ({ ...prev, [keyName]: { ...prev[keyName], cls: "" } })), 400);
      return;
    }
    if (keyName === task.key) {
      setBusy(true);
      setKeyFx((prev) => ({ ...prev, [keyName]: { fill: "#9fe0b8", cls: "correct" } }));
      showDrop(animalKey, keyEl);
      audio.playBeep(880, 0.15);
      kbTimeout(() => audio.playBeep(1100, 0.18), 180);
      setMessageHtml(`✅ 匹配成功！${a.name}放到了 ${keyLabel} 键 <span class="en">Match! ${a.en} on ${keyLabel}</span>`);
      if (levelRef.current === 3) audio.playNote(task.key, 0.35);
      kbTimeout(() => {
        if (levelRef.current === 3) {
          const song = songList[songIndexRef.current];
          const segs = song.segments[segmentIndexRef.current];
          const nextIdx = taskIndexRef.current + 1;
          if (nextIdx >= segs.length) {
            if (visibleRef.current) playSegmentMelody();
            else afterSegmentDemo(true);
          } else {
            setTaskIndex(nextIdx);
            renderMelodyView(false, songIndexRef.current, segmentIndexRef.current, nextIdx);
          }
        } else {
          const nextIdx = taskIndexRef.current + 1;
          if (nextIdx >= tasksRef.current.length) {
            if (levelRef.current === 1) {
              switchLevel(2);
              setMessageHtml('✅ 认识音名完成！开始帮我找位置吧！<span class="en">Learned! Find the position!</span>');
              return;
            }
            const shuffled = shuffleTasks();
            setTasks(shuffled);
            setTaskIndex(0);
            setMessageHtml('🎉 全部完成！再来一轮！<span class="en">All done! Another round!</span>');
            renderLearnTask(shuffled, 0, 2);
            return;
          }
          setTaskIndex(nextIdx);
          renderLearnTask(tasksRef.current, nextIdx, levelRef.current);
        }
      }, 0);
    } else {
      setKeyFx((prev) => ({ ...prev, [keyName]: { fill: "#f6a8c6", cls: "wrong shake" } }));
      audio.playBeep(200, 0.25);
      setMessageHtml(`❌ 琴键不对：${a.name}要放到 ${keyLabel} 键 <span class="en">Wrong key — put ${a.en} on ${keyLabel}</span>`);
      kbTimeout(() => {
        setKeyFx((prev) => ({ ...prev, [keyName]: { fill: DEFAULT_FILL, cls: "" } }));
        if (levelRef.current === 3) highlightKey(task.key);
      }, 600);
    }
  };

  const initCompose = (bars: number) => {
    setComposeNotes(new Array(bars * 4).fill(null));
    setComposeCursor(0);
    setComposePlaying(false);
    setComposeStatus(
      `已填 0 / ${bars * 4} 个音 · 当前：第 1 小节第 1 拍 <span class="en">Tap a piano key to fill the current beat</span>`,
    );
  };

  const updateComposeStatus = (notes: (NoteName | null)[], cursor: number) => {
    const filled = notes.filter(Boolean).length;
    const bar = Math.floor(cursor / 4) + 1;
    const beat = (cursor % 4) + 1;
    setComposeStatus(
      `已填 ${filled} / ${notes.length} 个音 · 当前：第 ${bar} 小节第 ${beat} 拍 <span class="en">Tap a piano key to fill the current beat</span>`,
    );
  };

  const switchLevel = (next: KbLevel) => {
    clearTimers();
    playingFull.current = false;
    playingSegment.current = false;
    setComposePlaying(false);
    setLevel(next);
    setBusy(false);
    setTaskIndex(0);
    setSelectedAnimal(null);
    setMelodyFlash(null);
    if (next === 1) {
      const list = [...TASK_POOL];
      setTasks(list);
      renderLearnTask(list, 0, 1);
    } else if (next === 2) {
      const list = shuffleTasks();
      setTasks(list);
      renderLearnTask(list, 0, 2);
      kbTimeout(playDragDemo, 400);
    } else if (next === 3) {
      setSegmentIndex(0);
      setTaskIndex(0);
      renderMelodyView(false, songIndexRef.current, 0, 0);
    } else {
      setTipHtml('点琴键，把音名填到当前拍 <span class="en">Tap a key to fill the current beat</span>');
      setMessageHtml("");
      initCompose(composeBars);
    }
  };

  const playDragDemo = () => {
    if (hasShownDragDemo.current || levelRef.current < 2) return;
    if (!visibleRef.current) return;
    hasShownDragDemo.current = true;
    const firstAnimal = document.querySelector<HTMLElement>(".animal-item");
    const targetKey = keyEls.current.get("C4");
    if (!firstAnimal || !targetKey) return;
    setDemoGhost({
      from: firstAnimal.getBoundingClientRect(),
      to: targetKey.getBoundingClientRect(),
      animal: (firstAnimal.dataset.animal as AnimalKey) || "cat",
    });
    kbTimeout(() => setDemoGhost(null), 1300);
  };

  const interruptMelody = () => {
    if (playingFull.current) {
      clearTimers();
      playingFull.current = false;
      const nextSong = (songIndexRef.current + 1) % songList.length;
      setSongIndex(nextSong);
      setSegmentIndex(0);
      setTaskIndex(0);
      setBusy(false);
      renderMelodyView(true, nextSong, 0, 0);
    } else if (playingSegment.current) {
      clearTimers();
      playingSegment.current = false;
      setBusy(false);
      afterSegmentDemo(true);
    }
  };

  useEffect(() => {
    registerHomeInterrupt(interruptMelody);
    return () => registerHomeInterrupt(null);
  });

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    switchLevel(1);
    // initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAnimalSelect = (k: AnimalKey) => {
    if (busyRef.current) return;
    setSelectedAnimal(k);
    const data = animalData[k];
    if (levelRef.current >= 2) {
      setMessageHtml(`已选 ${data.name}，请拖到琴键上（或再点琴键） <span class="en">Selected ${data.en} — drag onto a key</span>`);
    } else {
      setMessageHtml(`选择了 ${data.name}（${data.en}） <span class="en">Selected ${data.en}</span>`);
    }
  };

  const onKeyClick = (keyName: NoteName) => {
    if (busyRef.current) return;
    const el = keyEls.current.get(keyName);
    if (!el) return;
    if (levelRef.current === 4) {
      if (composePlayingRef.current) return;
      setComposeNotes((prev) => {
        const next = [...prev];
        const cursor = composeCursor;
        if (cursor >= next.length) return prev;
        next[cursor] = keyName;
        const nextCursor = Math.min(cursor + 1, next.length);
        setComposeCursor(nextCursor);
        updateComposeStatus(next, nextCursor);
        return next;
      });
      audio.playNote(keyName, 0.25);
      return;
    }
    if (!selectedRef.current) {
      setMessageHtml('请先选一只小动物 <span class="en">Please choose an animal first</span>');
      setKeyFx((prev) => ({ ...prev, [keyName]: { ...prev[keyName], cls: "shake" } }));
      kbTimeout(() => setKeyFx((prev) => ({ ...prev, [keyName]: { ...prev[keyName], cls: "" } })), 400);
      return;
    }
    handlePlace(selectedRef.current, keyName, el);
  };

  const keyAtPoint = (x: number, y: number) => {
    for (const [name, el] of keyEls.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return { name, el };
    }
    return null;
  };

  const onMissedDrop = () => {
    if (levelRef.current === 3) {
      setMessageHtml('👆 请拖到亮起的琴键上 <span class="en">Please drop onto the lit piano key</span>');
      audio.playBeep(220, 0.2);
    } else if (levelRef.current === 2) {
      setMessageHtml('没放到琴键上，再拖一次对准琴键 <span class="en">Drop it onto a piano key</span>');
      audio.playBeep(220, 0.2);
    } else {
      setMessageHtml('可以点选小动物再点琴键哦 <span class="en">Tap the animal, then tap its key</span>');
    }
  };

  const composeBack = () => {
    if (composePlayingRef.current) return;
    setComposeNotes((prev) => {
      const cursor = composeCursor;
      const nextCursor = cursor > 0 ? cursor - 1 : 0;
      const next = [...prev];
      next[nextCursor] = null;
      setComposeCursor(nextCursor);
      updateComposeStatus(next, nextCursor);
      return next;
    });
  };

  const composeClear = () => {
    if (composePlayingRef.current) return;
    initCompose(composeBars);
  };

  const composePlay = () => {
    const filled: { note: NoteName; idx: number }[] = [];
    composeNotes.forEach((n, i) => {
      if (n) filled.push({ note: n, idx: i });
    });
    if (!filled.length) {
      setComposeStatus('请先填入音符 <span class="en">Please add some notes first</span>');
      return;
    }
    if (composePlayingRef.current) return;
    setComposePlaying(true);
    setComposeStatus('🎵 AI 演奏中… <span class="en">Playing your melody…</span>');
    playMelodySequence(
      filled.map((f) => f.note),
      filled.map(() => 1),
      (_n, i) => {
        setPlayingCell(filled[i].idx);
      },
      () => {
        setComposePlaying(false);
        setBusy(false);
        setPlayingCell(null);
        setComposeStatus('✅ 演奏完成！<span class="en">Finished!</span>');
      },
      500,
    );
  };

  const changeBars = (bars: number) => {
    if (composePlayingRef.current) return;
    setComposeBars(bars);
    initCompose(bars);
  };

  const selectSong = (i: number) => {
    if (busyRef.current) return;
    setSongIndex(i);
    setSegmentIndex(0);
    setTaskIndex(0);
    renderMelodyView(false, i, 0, 0);
  };

  return {
    level,
    switchLevel,
    selectedAnimal,
    onAnimalSelect,
    onKeyClick,
    setKeyEl,
    keyFx,
    keyAtPoint,
    handlePlace,
    onMissedDrop,
    dragging,
    setDragging,
    dropFeedback,
    demoGhost,
    messageHtml,
    taskHtml,
    progressHtml,
    guideHtml,
    tipHtml,
    tasks,
    taskIndex,
    songIndex,
    segmentIndex,
    selectSong,
    melodyFlash,
    composeBars,
    composeNotes,
    composeCursor,
    setComposeCursor,
    composeStatus,
    composePlaying,
    changeBars,
    composeBack,
    composeClear,
    composePlay,
    playingCell,
    NOTE_LABEL,
    visible,
  };
}
