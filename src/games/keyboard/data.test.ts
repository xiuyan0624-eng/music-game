import { describe, expect, it } from "vitest";
import { animalData, keyDisplay, noteToTask, ORDERED_ANIMALS, songList, TASK_POOL } from "./data";

describe("keyboard data", () => {
  it("maps notes to animals", () => {
    expect(noteToTask("C4")).toEqual({ animalKey: "cat", key: "C4" });
    expect(TASK_POOL).toHaveLength(7);
  });

  it("splits songs into 4-note segments", () => {
    const song = songList[0];
    expect(song.segments[0]).toEqual(["C4", "C4", "G", "G"]);
    expect(song.segments.flat()).toEqual(song.notes);
  });

  it("labels middle C", () => {
    expect(keyDisplay("C4", true)).toBe("C (中央C)");
    expect(keyDisplay("G")).toBe("G");
  });

  it("keeps the canonical animal row in C D E F G A B order", () => {
    expect(ORDERED_ANIMALS.map((key) => animalData[key].letter).join("")).toBe("CDEFGAB");
  });
});
