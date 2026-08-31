import type { ReactNode } from "react";

export function En({ children }: { children: ReactNode }) {
  return <span className="en">{children}</span>;
}
