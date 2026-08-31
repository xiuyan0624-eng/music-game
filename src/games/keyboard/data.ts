import { assetUrl } from "../../lib/assets";

export type NoteName = "C4" | "D" | "E" | "F" | "G" | "A" | "B";
export type AnimalKey = "cat" | "dog" | "elephant" | "fox" | "goat" | "ant" | "bear";

export type Animal = {
  key: NoteName;
  name: string;
  letter: string;
  en: string;
  src: string;
};

export const animalData: Record<AnimalKey, Animal> = {
  cat: { key: "C4", name: "小猫", letter: "C", en: "Cat", src: assetUrl("animal-cat.png") },
  dog: { key: "D", name: "小狗", letter: "D", en: "Dog", src: assetUrl("animal-dog.png") },
  elephant: { key: "E", name: "小象", letter: "E", en: "Elephant", src: assetUrl("animal-elephant.png") },
  fox: { key: "F", name: "狐狸", letter: "F", en: "Fox", src: assetUrl("animal-fox.png") },
  goat: { key: "G", name: "山羊", letter: "G", en: "Goat", src: assetUrl("animal-goat.png") },
  ant: { key: "A", name: "蚂蚁", letter: "A", en: "Ant", src: assetUrl("animal-ant.png") },
  bear: { key: "B", name: "小熊", letter: "B", en: "Bear", src: assetUrl("animal-bear.png") },
};

export const animalOfNote: Record<NoteName, AnimalKey> = {
  C4: "cat",
  D: "dog",
  E: "elephant",
  F: "fox",
  G: "goat",
  A: "ant",
  B: "bear",
};

export const WHITE_KEYS: { key: NoteName; x: number; labelX: number; labelSize: number; labelFill: string }[] = [
  { key: "C4", x: 10, labelX: 45, labelSize: 18, labelFill: "#c74f7d" },
  { key: "D", x: 85, labelX: 120, labelSize: 16, labelFill: "#766562" },
  { key: "E", x: 160, labelX: 195, labelSize: 16, labelFill: "#766562" },
  { key: "F", x: 235, labelX: 270, labelSize: 16, labelFill: "#766562" },
  { key: "G", x: 310, labelX: 345, labelSize: 16, labelFill: "#766562" },
  { key: "A", x: 385, labelX: 420, labelSize: 16, labelFill: "#766562" },
  { key: "B", x: 460, labelX: 495, labelSize: 16, labelFill: "#766562" },
];

export const BLACK_KEYS_X = [55, 130, 280, 355, 430];

export const KEY_ANIMALS: { animal: AnimalKey; x: number }[] = [
  { animal: "cat", x: 20 },
  { animal: "dog", x: 95 },
  { animal: "elephant", x: 170 },
  { animal: "fox", x: 245 },
  { animal: "goat", x: 320 },
  { animal: "ant", x: 395 },
  { animal: "bear", x: 470 },
];

export type PlaceTask = { animalKey: AnimalKey; key: NoteName };

export function noteToTask(n: NoteName): PlaceTask {
  return { animalKey: animalOfNote[n], key: n };
}

export type Song = {
  name: string;
  enName: string;
  notes: NoteName[];
  durationBeats: number[];
  segments: NoteName[][];
};

function withSegments(song: Omit<Song, "segments">): Song {
  const segments: NoteName[][] = [];
  for (let i = 0; i < song.notes.length; i += 4) segments.push(song.notes.slice(i, i + 4));
  return { ...song, segments };
}

export const songList: Song[] = [
  withSegments({
    name: "小星星",
    enName: "Twinkle Twinkle",
    notes: ["C4", "C4", "G", "G", "A", "A", "G", "F", "F", "E", "E", "D", "D", "C4"],
    durationBeats: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
  }),
  withSegments({
    name: "玛莉有只小羊羔",
    enName: "Mary Had a Little Lamb",
    notes: ["E", "D", "C4", "D", "E", "E", "E", "D", "D", "D", "E", "G", "G"],
    durationBeats: [1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2],
  }),
  withSegments({
    name: "欢乐颂",
    enName: "Ode to Joy",
    notes: ["E", "E", "F", "G", "G", "F", "E", "D", "C4", "C4", "D", "E", "E", "D", "D"],
    durationBeats: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  }),
  withSegments({
    name: "粉刷匠",
    enName: "The Painter",
    notes: ["G", "E", "G", "E", "G", "E", "C4", "D", "F", "E", "D", "G", "G", "E", "G", "E", "G", "E", "C4", "D", "F", "E", "D", "C4"],
    durationBeats: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2],
  }),
  withSegments({
    name: "两只老虎",
    enName: "Two Tigers",
    notes: ["C4", "D", "E", "C4", "C4", "D", "E", "C4", "E", "F", "G", "E", "F", "G", "G", "A", "G", "F", "E", "C4", "G", "A", "G", "F", "E", "C4", "C4", "G", "C4", "C4", "G", "C4"],
    durationBeats: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2],
  }),
  withSegments({
    name: "铃儿响叮当",
    enName: "Jingle Bells",
    notes: ["E", "E", "E", "E", "E", "E", "E", "G", "C4", "D", "E", "F", "F", "F", "F", "F", "E", "E", "E", "E", "D", "D", "E", "D", "G"],
    durationBeats: [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  }),
  withSegments({
    name: "新年好",
    enName: "Happy New Year",
    notes: ["C4", "C4", "C4", "G", "E", "E", "E", "C4", "C4", "E", "G", "G", "F", "E", "D", "D", "E", "F", "E", "D", "E", "C4", "C4", "E", "D", "G", "C4"],
    durationBeats: [1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 4],
  }),
];

export const TASK_POOL: PlaceTask[] = [
  { animalKey: "cat", key: "C4" },
  { animalKey: "dog", key: "D" },
  { animalKey: "elephant", key: "E" },
  { animalKey: "fox", key: "F" },
  { animalKey: "goat", key: "G" },
  { animalKey: "ant", key: "A" },
  { animalKey: "bear", key: "B" },
];

export function shuffleTasks(pool: PlaceTask[] = TASK_POOL): PlaceTask[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const MELODY_BEAT_MS = 480;
export const NOTE_LABEL: Record<NoteName, string> = {
  C4: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  A: "A",
  B: "B",
};

export function keyDisplay(note: NoteName, longC = false): string {
  if (note === "C4") return longC ? "C (中央C)" : "C";
  return note;
}
