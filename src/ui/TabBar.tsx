import type { ReactNode } from "react";

type Item = {
  id: string;
  label: ReactNode;
  hidden?: boolean;
};

type Props = {
  items: Item[];
  activeId: string;
  onChange: (id: string) => void;
  buttonClass: "stage-btn" | "level-tab";
};

export function TabBar({ items, activeId, onChange, buttonClass }: Props) {
  return (
    <div className={buttonClass === "stage-btn" ? "stage-select" : "level-tabs"}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${buttonClass}${item.id === activeId ? " active" : ""}`}
          hidden={item.hidden}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
