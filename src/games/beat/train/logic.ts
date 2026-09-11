import { beatNotePool, type NoteKey } from "../logic";
import { TIME_SIGS } from "../apple/logic";

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
export const CARRIAGE_COLORS = ["#FFB7C9", "#9BD0EE", "#FFE2A0", "#9FE0BB"];

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
