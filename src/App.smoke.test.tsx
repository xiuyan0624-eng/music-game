import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  if (typeof PointerEvent === "undefined") {
    class PointerEventPolyfill extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: MouseEventInit & { pointerId?: number } = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
      }
    }
    Object.defineProperty(globalThis, "PointerEvent", { value: PointerEventPolyfill });
  }
});

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("classroom smoke", () => {
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    act(() => {
      root = createRoot(host);
      root.render(<App />);
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    history.replaceState(null, "", "/");
  });

  it("opens beat game from home and shows learn stage keys", () => {
    expect(host.textContent).toContain("乐理小游戏");
    const beat = [...host.querySelectorAll(".project-card")].find((el) => el.textContent?.includes("节拍游戏"));
    expect(beat).toBeTruthy();
    click(beat!);
    expect(host.textContent).toContain("认识时值");
    expect(host.querySelectorAll(".beat-key")).toHaveLength(4);
    const appleBtn = [...host.querySelectorAll(".stage-btn")].find((el) => el.textContent?.includes("分拍小苹果"));
    const trainBtn = [...host.querySelectorAll(".stage-btn")].find((el) => el.textContent?.includes("拍号小火车"));
    expect(appleBtn).toBeTruthy();
    expect(trainBtn).toBeTruthy();
    expect((appleBtn as HTMLButtonElement).hidden).toBe(false);
    expect((trainBtn as HTMLButtonElement).hidden).toBe(false);
    click(appleBtn!);
    expect(host.textContent).not.toContain("把苹果拖到餐盘里");
    expect(host.querySelectorAll(".apple-card")).toHaveLength(3);
    expect(host.querySelectorAll(".apple-card .ac-note svg")).toHaveLength(3);

    const exampleBars = host.querySelectorAll(".apple-bar.example");
    expect(exampleBars).toHaveLength(2);
    expect(host.querySelectorAll(".apple-example-badge")).toHaveLength(2);
    expect(host.textContent).toContain("示例");
    expect(host.textContent).toContain("只能看");
    expect(host.textContent).not.toContain("待填");
    expect(host.textContent).not.toContain("第 1 小节（看看）");
    expect(host.textContent).toContain("第 1 小节（你来放）");
    expect(host.querySelectorAll(".apple-bar.example .plate-empty")).toHaveLength(0);
    expect(host.querySelectorAll(".apple-plates[data-plates]")).toHaveLength(4);

    const exampleApple = host.querySelector(".apple-bar.example .plate-item");
    expect(exampleApple).toBeTruthy();
    expect(() => click(exampleApple!)).not.toThrow();
    expect(host.querySelectorAll(".apple-bar.example .plate-item").length).toBeGreaterThan(0);
    host.querySelectorAll(".apple-bar.example .apple-plate").forEach((plate) => {
      expect((plate as HTMLElement).dataset.table).toBeUndefined();
    });

    const examplePlate = host.querySelector(".apple-bar.example .apple-plate") as HTMLElement;
    examplePlate.getBoundingClientRect = () => ({
      x: 10,
      y: 10,
      width: 40,
      height: 40,
      top: 10,
      right: 50,
      bottom: 50,
      left: 10,
      toJSON: () => ({}),
    });
    const card = host.querySelector(".apple-card")!;
    act(() => {
      card.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 20, clientY: 20 }));
    });
    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 20, clientY: 20 }));
    });
    expect(host.textContent).toContain("这是例子哦");
    document.querySelectorAll(".apple-drag-clone").forEach((el) => el.remove());

    const eighth = [...host.querySelectorAll(".ts-btn")].find((el) => el.textContent?.includes("3/8"));
    click(eighth!);
    expect(host.querySelectorAll(".apple-bar.example")).toHaveLength(0);
    expect(host.textContent).toContain("第 1 小节（你来放）");
  });

  it("opens keyboard game and keeps four levels", () => {
    const kb = [...host.querySelectorAll(".project-card")].find((el) => el.textContent?.includes("我是谁"));
    click(kb!);
    expect(host.textContent).toContain("认识音名");
    expect(host.querySelectorAll(".level-tab")).toHaveLength(4);
    expect(host.querySelectorAll(".animal-item")).toHaveLength(7);
    expect(host.querySelectorAll(".key-white")).toHaveLength(7);
  });

  it("shuffles Find Position but restores C D E F G A B in Melody Game", () => {
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      const keyboard = [...host.querySelectorAll(".project-card")].find((el) => el.textContent?.includes("我是谁"));
      click(keyboard!);

      const findPosition = [...host.querySelectorAll(".level-tab")].find((el) => el.textContent?.includes("帮我找位置"));
      click(findPosition!);
      const findOrder = [...host.querySelectorAll(".animal-item .first-letter")].map((el) => el.textContent).join("");
      expect(findOrder).not.toBe("CDEFGAB");

      const melody = [...host.querySelectorAll(".level-tab")].find((el) => el.textContent?.includes("旋律游戏"));
      click(melody!);
      const melodyOrder = [...host.querySelectorAll(".animal-item .first-letter")].map((el) => el.textContent).join("");
      expect(melodyOrder).toBe("CDEFGAB");
    } finally {
      Math.random = originalRandom;
    }
  });

  it("honors #beat and #keyboard hashes", () => {
    act(() => root.unmount());
    history.replaceState(null, "", "/#beat");
    act(() => {
      root = createRoot(host);
      root.render(<App />);
    });
    expect(host.querySelectorAll(".beat-key")).toHaveLength(4);

    act(() => root.unmount());
    history.replaceState(null, "", "/#keyboard");
    act(() => {
      root = createRoot(host);
      root.render(<App />);
    });
    expect(host.querySelectorAll(".animal-item")).toHaveLength(7);
    expect(host.textContent).toContain("认识音名");
  });

  it("requires beat taps in order 1 then 2", () => {
    const beat = [...host.querySelectorAll(".project-card")].find((el) => el.textContent?.includes("节拍游戏"));
    click(beat!);
    const keys = host.querySelectorAll(".beat-key");
    click(keys[1]!);
    expect(host.textContent).toContain("顺序不对");
  });
});
