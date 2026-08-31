import { beatNotePool, type NoteKey } from "../logic";
import { TIME_SIGS } from "../apple/logic";

export { TIME_SIGS };

export const TRAIN_NOTES: Record<NoteKey, { name: string; beats: number; svg: string }> = {
  quarter: { name: "四分音符", beats: 1, svg: beatNotePool.quarter.noteSvg },
  half: { name: "二分音符", beats: 2, svg: beatNotePool.half.noteSvg },
  dottedHalf: { name: "附点二分音符", beats: 3, svg: beatNotePool.dottedHalf.noteSvg },
  whole: { name: "全音符", beats: 4, svg: beatNotePool.whole.noteSvg },
};

export const TRAIN_BARS = 4;
export const CARRIAGE_COLORS = ["#FFB7C9", "#9BD0EE", "#FFE2A0", "#9FE0BB"];

export function emptyCarriages(): NoteKey[][] {
  return Array.from({ length: TRAIN_BARS }, () => []);
}

export function carriageSum(notes: NoteKey[]): number {
  return notes.reduce((s, t) => s + TRAIN_NOTES[t].beats, 0);
}

export function trainStatus(carriages: NoteKey[][], beatsPerBar: number) {
  let allCorrect = true;
  let allFilled = true;
  carriages.forEach((notes) => {
    const sum = carriageSum(notes);
    if (notes.length === 0) allFilled = false;
    if (sum !== beatsPerBar) allCorrect = false;
  });
  return { allCorrect, allFilled };
}
