import { describe, expect, it } from "vitest";
import { applyBeatTap, buildLearnQuestions, buildRandomGroupQuestions } from "./logic";

describe("buildLearnQuestions", () => {
  it("walks quarter through whole in order", () => {
    const qs = buildLearnQuestions();
    expect(qs.map((q) => q.noteKey)).toEqual(["quarter", "half", "dottedHalf", "whole"]);
    expect(qs[0].groupId).toBeUndefined();
  });
});

describe("buildRandomGroupQuestions", () => {
  it("builds six groups with increasing sizes", () => {
    const qs = buildRandomGroupQuestions(() => 0);
    expect(qs.filter((q) => q.groupId === 0)).toHaveLength(2);
    expect(qs.filter((q) => q.groupId === 2)).toHaveLength(4);
  });
});

describe("applyBeatTap", () => {
  const questions = buildLearnQuestions();

  it("rejects out-of-order taps", () => {
    expect(applyBeatTap(0, 2, 1, 0, questions)).toEqual({ kind: "wrong-order", expected: 1 });
  });

  it("counts sequential taps then completes the note", () => {
    expect(applyBeatTap(0, 1, 2, 1, questions)).toEqual({ kind: "tap", tapCount: 1, complete: false });
    expect(applyBeatTap(1, 2, 2, 1, questions).kind).toBe("complete");
  });

  it("marks all-done on the last question", () => {
    const last = questions.length - 1;
    const taps = 4;
    expect(applyBeatTap(3, 4, taps, last, questions)).toEqual({
      kind: "complete",
      tapCount: 4,
      outcome: "all",
    });
  });
});
