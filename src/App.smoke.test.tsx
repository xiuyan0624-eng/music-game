import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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
    expect((appleBtn as HTMLButtonElement).hidden).toBe(true);
    expect((trainBtn as HTMLButtonElement).hidden).toBe(true);
  });

  it("opens keyboard game and keeps four levels", () => {
    const kb = [...host.querySelectorAll(".project-card")].find((el) => el.textContent?.includes("我是谁"));
    click(kb!);
    expect(host.textContent).toContain("认识音名");
    expect(host.querySelectorAll(".level-tab")).toHaveLength(4);
    expect(host.querySelectorAll(".animal-item")).toHaveLength(7);
    expect(host.querySelectorAll(".key-white")).toHaveLength(7);
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
