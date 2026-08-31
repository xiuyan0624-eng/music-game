import type { ReactNode } from "react";

type Props = {
  iconSrc: string;
  title: ReactNode;
  subtitle: string;
  onClick: () => void;
};

export function ProjectCard({ iconSrc, title, subtitle, onClick }: Props) {
  return (
    <button type="button" className="project-card" onClick={onClick}>
      <span className="project-icon" aria-hidden="true">
        <img src={iconSrc} alt="" />
      </span>
      <span className="project-body">
        <span className="project-title">{title}</span>
        <span className="project-sub">{subtitle}</span>
      </span>
    </button>
  );
}
