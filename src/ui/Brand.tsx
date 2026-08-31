import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";

type Props = {
  children: ReactNode;
};

export function Brand({ children }: Props) {
  const { goHome } = useApp();
  return (
    <a
      className="brand"
      href="#"
      aria-label="乐理小游戏首页"
      onClick={(e) => {
        e.preventDefault();
        goHome();
      }}
    >
      {children}
    </a>
  );
}
