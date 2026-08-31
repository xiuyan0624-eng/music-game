import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function BackButton({ children, className = "", onClick }: Props) {
  return (
    <button type="button" className={`back-btn ${className}`.trim()} onClick={onClick}>
      {children}
    </button>
  );
}
