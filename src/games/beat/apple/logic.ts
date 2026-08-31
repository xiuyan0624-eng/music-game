export const TIME_SIGS = [
  { label: "2/4", beats: 2 },
  { label: "3/4", beats: 3 },
  { label: "4/4", beats: 4 },
] as const;

export const APPLE_NOTES = {
  whole: {
    name: "完整苹果",
    label: "四分音符 · 一拍",
    beats: 1,
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="23" r="13" fill="#E74C3C"/><path d="M 20 10 Q 20 6 22 3" stroke="#7B4B2A" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="6" rx="5" ry="3" fill="#6FBF73"/><circle cx="15" cy="19" r="3" fill="#fff" opacity="0.3"/></svg>`,
  },
  half: {
    name: "半个苹果",
    label: "八分音符 · 半拍",
    beats: 0.5,
    svg: `<svg viewBox="0 0 40 40"><path d="M 7 22 A 13 13 0 0 0 33 22 Z" fill="#FFF6E5" stroke="#E74C3C" stroke-width="3"/><ellipse cx="20" cy="22" rx="3" ry="4.5" fill="#7B4B2A"/><ellipse cx="15" cy="21" rx="2" ry="3" fill="#5D4037"/><ellipse cx="25" cy="21" rx="2" ry="3" fill="#5D4037"/></svg>`,
  },
} as const;

export type AppleNoteType = keyof typeof APPLE_NOTES;
export type AppleTables = AppleNoteType[][][];

export const TABLE_KIDS = ["👧", "👦", "🧒", "👶", "🧑", "👨"];

export function emptyAppleTables(): AppleTables {
  return [
    [[], []],
    [[], []],
    [[], []],
    [[], []],
  ];
}

export function plateSum(items: AppleNoteType[]): number {
  return items.reduce((s, x) => s + APPLE_NOTES[x].beats, 0);
}

export function tableDone(plates: AppleNoteType[][], plateTarget: number): boolean {
  return plates.every((items) => plateSum(items) === plateTarget);
}
