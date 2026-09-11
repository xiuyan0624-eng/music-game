import { assetUrl } from "../../../lib/assets";
import { type NoteKey } from "../logic";
import { NOTE_SVG } from "../noteSvg";
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

export const TRAIN_NOTES: Record<TrainNoteKey, { name: string; beats: number; svg: string }> = {
  sixteenth: { name: "十六分音符", beats: 0.25, svg: NOTE_SVG.sixteenth },
  eighth: { name: "八分音符", beats: 0.5, svg: NOTE_SVG.eighth },
  quarter: { name: "四分音符", beats: 1, svg: NOTE_SVG.quarter },
  half: { name: "二分音符", beats: 2, svg: NOTE_SVG.half },
  dottedHalf: { name: "附点二分音符", beats: 3, svg: NOTE_SVG.dottedHalf },
  whole: { name: "全音符", beats: 4, svg: NOTE_SVG.whole },
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
