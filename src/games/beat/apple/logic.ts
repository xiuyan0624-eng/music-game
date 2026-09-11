import { assetUrl } from "../../../lib/assets";
import { NOTE_SVG } from "../noteSvg";

export const TIME_SIGS = [
  { label: "2/4", beats: 2, cn: "四二拍" },
  { label: "3/4", beats: 3, cn: "四三拍" },
  { label: "4/4", beats: 4, cn: "四四拍" },
  { label: "3/8", beats: 3, cn: "八三拍" },
] as const;

export const TABLE_IMG = assetUrl("table.png");
export const PLATE_IMG = assetUrl("plate.png");

export const APPLE_NOTES = {
  whole: {
    name: "完整苹果",
    label: "四分音符 · 一拍",
    beats: 1,
    img: assetUrl("apple.png"),
    noteSvg: NOTE_SVG.quarter,
  },
  half: {
    name: "半个苹果",
    label: "八分音符 · 半拍",
    beats: 0.5,
    img: assetUrl("apple-half.png"),
    noteSvg: NOTE_SVG.eighth,
  },
  quarter: {
    name: "四分之一苹果",
    label: "十六分音符 · ¼ 拍",
    beats: 0.25,
    img: assetUrl("apple-quarter.png"),
    noteSvg: NOTE_SVG.sixteenth,
  },
} as const;

export type AppleNoteType = keyof typeof APPLE_NOTES;
export type AppleTables = AppleNoteType[][][];

/** 桌边的小动物（4 只轮换） */
export const TABLE_FRIENDS = [
  assetUrl("friend-cat.png"),
  assetUrl("friend-dog.png"),
  assetUrl("friend-rabbit.png"),
  assetUrl("friend-raccoon.png"),
];

export function tableFriend(index: number): string {
  return TABLE_FRIENDS[index % TABLE_FRIENDS.length];
}

export function emptyAppleTables(platesPerBar: number): AppleTables {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: platesPerBar }, () => [] as AppleNoteType[]),
  );
}

export function plateSum(items: AppleNoteType[], scale = 1): number {
  return items.reduce((s, x) => s + APPLE_NOTES[x].beats * scale, 0);
}

export function tableDone(plates: AppleNoteType[][], plateTarget: number, scale = 1): boolean {
  return plates.every((items) => plateSum(items, scale) === plateTarget);
}
