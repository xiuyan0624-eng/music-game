import { assetUrl } from "../../lib/assets";

export type NoteKey = "quarter" | "half" | "dottedHalf" | "whole";

export type BeatNote = {
  name: string;
  taps: number;
  animalSrc: string;
  animalAlt: string;
  noteSvg: string;
};

export const beatNotePool: Record<NoteKey, BeatNote> = {
  quarter: {
    name: "四分音符",
    taps: 1,
    animalSrc: assetUrl("beat-quarter.png"),
    animalAlt: "四分音符",
    noteSvg: `<svg width="14" height="34" viewBox="0 0 20 44"><ellipse cx="8" cy="32" rx="7" ry="5" fill="#211b1c"/><rect x="14" y="6" width="3" height="28" fill="#211b1c"/></svg>`,
  },
  half: {
    name: "二分音符",
    taps: 2,
    animalSrc: assetUrl("beat-half.png"),
    animalAlt: "二分音符",
    noteSvg: `<svg width="14" height="34" viewBox="0 0 20 44"><ellipse cx="8" cy="32" rx="7" ry="5" fill="#fffdf7" stroke="#211b1c" stroke-width="2.5"/><rect x="14" y="6" width="3" height="28" fill="#211b1c"/></svg>`,
  },
  dottedHalf: {
    name: "附点二分音符",
    taps: 3,
    animalSrc: assetUrl("beat-dotted-half.png"),
    animalAlt: "附点二分音符",
    noteSvg: `<svg width="20" height="34" viewBox="0 0 28 44"><ellipse cx="8" cy="32" rx="7" ry="5" fill="#fffdf7" stroke="#211b1c" stroke-width="2.5"/><rect x="14" y="6" width="3" height="28" fill="#211b1c"/><circle cx="22" cy="36" r="4" fill="#211b1c"/></svg>`,
  },
  whole: {
    name: "全音符",
    taps: 4,
    animalSrc: assetUrl("beat-whole.png"),
    animalAlt: "全音符",
    noteSvg: `<svg width="16" height="28" viewBox="0 0 24 36"><ellipse cx="12" cy="22" rx="9" ry="7" fill="#fffdf7" stroke="#211b1c" stroke-width="2.5"/></svg>`,
  },
};

export type BeatQuestion = {
  noteKey: NoteKey;
  groupId?: number;
  groupSize?: number;
  noteIndex: number;
  groupNotes: NoteKey[];
  groupLabel: string;
};

export type TapResult =
  | { kind: "wrong-order"; expected: number }
  | { kind: "tap"; tapCount: number; complete: false }
  | { kind: "complete"; tapCount: number; outcome: "all" | "group" | "note" };

export function buildLearnQuestions(): BeatQuestion[] {
  const seq: NoteKey[] = ["quarter", "half", "dottedHalf", "whole"];
  return seq.map((key, i) => ({
    noteKey: key,
    groupNotes: [key],
    noteIndex: 0,
    groupLabel: `认识时值 ${i + 1} / ${seq.length}`,
  }));
}

export function buildRandomGroupQuestions(random = Math.random): BeatQuestion[] {
  const pool: NoteKey[] = ["quarter", "half", "dottedHalf", "whole"];
  const sizes = [2, 3, 4, 2, 3, 4];
  const questions: BeatQuestion[] = [];
  sizes.forEach((size, gi) => {
    const shuffled = [...pool].sort(() => random() - 0.5);
    const group = shuffled.slice(0, size);
    group.forEach((noteKey, ni) => {
      questions.push({
        noteKey,
        groupId: gi,
        groupSize: size,
        noteIndex: ni,
        groupNotes: group,
        groupLabel: `第 ${gi + 1}/${sizes.length} 组 · ${size}个音符 · 音符 ${ni + 1}/${size}`,
      });
    });
  });
  return questions;
}

export function applyBeatTap(
  tapCount: number,
  n: number,
  noteTaps: number,
  currentIndex: number,
  questions: BeatQuestion[],
): TapResult {
  if (n !== tapCount + 1) {
    return { kind: "wrong-order", expected: tapCount + 1 };
  }
  const nextCount = tapCount + 1;
  if (nextCount !== noteTaps) {
    return { kind: "tap", tapCount: nextCount, complete: false };
  }
  const q = questions[currentIndex];
  const nextQ = questions[currentIndex + 1];
  if (!nextQ) return { kind: "complete", tapCount: nextCount, outcome: "all" };
  if (q.groupId !== undefined && nextQ.groupId !== q.groupId) {
    return { kind: "complete", tapCount: nextCount, outcome: "group" };
  }
  return { kind: "complete", tapCount: nextCount, outcome: "note" };
}
