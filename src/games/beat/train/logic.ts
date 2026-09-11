import { assetUrl } from "../../../lib/assets";
import { beatNotePool, type NoteKey } from "../logic";
import { TIME_SIGS } from "../apple/logic";

/** 火车配色：粉 / 黄 / 蓝 */
export const TRAIN_ENGINE_IMGS = [
  assetUrl("train-engine-pink.png"),
  assetUrl("train-engine-yellow.png"),
  assetUrl("train-engine-blue.png"),
];
export const CARRIAGE_IMGS = [
  assetUrl("train-carriage-pink.png"),
  assetUrl("train-carriage-yellow.png"),
  assetUrl("train-carriage-blue.png"),
];

/** 每个拍号对应一种火车配色（2/4 粉 · 3/4 黄 · 4/4 蓝 · 3/8 粉） */
export function trainColorIndex(tsLabel: string): number {
  const i = TIME_SIGS.findIndex((t) => t.label === tsLabel);
  return (i < 0 ? 0 : i) % TRAIN_ENGINE_IMGS.length;
}

export { TIME_SIGS };

export type TrainNoteKey = NoteKey | "eighth" | "sixteenth";

const EIGHTH_SVG = `<svg width="14" height="34" viewBox="0 0 20 44"><ellipse cx="8" cy="32" rx="7" ry="5" fill="#211b1c"/><rect x="14" y="6" width="3" height="28" fill="#211b1c"/><path d="M 17 7 Q 24 11 22 20" stroke="#211b1c" stroke-width="2.5" fill="none"/></svg>`;
const SIXTEENTH_SVG = `<svg width="14" height="34" viewBox="0 0 20 44"><ellipse cx="8" cy="32" rx="7" ry="5" fill="#211b1c"/><rect x="14" y="6" width="3" height="28" fill="#211b1c"/><path d="M 17 7 Q 24 11 22 20" stroke="#211b1c" stroke-width="2.5" fill="none"/><path d="M 17 14 Q 25 18 22 28" stroke="#211b1c" stroke-width="2.5" fill="none"/></svg>`;

export const TRAIN_NOTES: Record<TrainNoteKey, { name: string; beats: number; svg: string }> = {
  sixteenth: { name: "十六分音符", beats: 0.25, svg: SIXTEENTH_SVG },
  eighth: { name: "八分音符", beats: 0.5, svg: EIGHTH_SVG },
  quarter: { name: "四分音符", beats: 1, svg: beatNotePool.quarter.noteSvg },
  half: { name: "二分音符", beats: 2, svg: beatNotePool.half.noteSvg },
  dottedHalf: { name: "附点二分音符", beats: 3, svg: beatNotePool.dottedHalf.noteSvg },
  whole: { name: "全音符", beats: 4, svg: beatNotePool.whole.noteSvg },
};

export const TRAIN_BARS = 5;

export function emptyCarriages(): TrainNoteKey[][] {
  return Array.from({ length: TRAIN_BARS }, () => []);
}

export function carriageSum(notes: TrainNoteKey[]): number {
  return notes.reduce((s, t) => s + TRAIN_NOTES[t].beats, 0);
}

export function trainStatus(carriages: TrainNoteKey[][], beatsPerBar: number) {
  let allCorrect = true;
  let allFilled = true;
  carriages.forEach((notes) => {
    const sum = carriageSum(notes);
    if (notes.length === 0) allFilled = false;
    if (sum !== beatsPerBar) allCorrect = false;
  });
  return { allCorrect, allFilled };
}
