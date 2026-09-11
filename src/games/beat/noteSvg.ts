const PAPER = "#fffdf7";

/** Colors sampled from the cartoon note reference. */
export const NOTE_COLOR = {
  sixteenth: "#74CBF5",
  eighth: "#8ED352",
  quarter: "#FF9BC4",
  half: "#F6D24A",
  dottedHalf: "#F6D24A",
  whole: "#FF9BC4",
} as const;

function svg(inner: string, viewBox: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="40" height="48" overflow="visible" aria-hidden="true">${inner}</svg>`;
}

function cartoonNote(opts: {
  color: string;
  flags?: 0 | 1 | 2;
  hollow?: boolean;
  dot?: boolean;
}): string {
  const { color, flags = 0, hollow = false, dot = false } = opts;
  const head = hollow
    ? `<ellipse cx="26" cy="71" rx="17" ry="14" transform="rotate(-22 26 71)" fill="${PAPER}" stroke="${color}" stroke-width="5"/>`
    : `<ellipse cx="26" cy="71" rx="17" ry="14" transform="rotate(-22 26 71)" fill="${color}"/>`;
  const stem =
    flags === 0
      ? `<path d="M36 14 L36 70" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`
      : `<path d="M36 70 L36 16 C60 10 74 18 68 44" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  const flag2 =
    flags >= 2
      ? `<path d="M41 34 C60 30 74 38 68 62" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`
      : "";
  const dotEl = dot ? `<circle cx="54" cy="73" r="6.2" fill="${color}"/>` : "";
  const vb = flags ? "0 0 84 90" : dot ? "0 0 66 90" : "0 0 52 90";
  return svg(`${stem}${flag2}${head}${dotEl}`, vb);
}

export const NOTE_SVG = {
  sixteenth: cartoonNote({ color: NOTE_COLOR.sixteenth, flags: 2 }),
  eighth: cartoonNote({ color: NOTE_COLOR.eighth, flags: 1 }),
  quarter: cartoonNote({ color: NOTE_COLOR.quarter }),
  half: cartoonNote({ color: NOTE_COLOR.half, hollow: true }),
  dottedHalf: cartoonNote({ color: NOTE_COLOR.dottedHalf, hollow: true, dot: true }),
  whole: svg(
    `<ellipse cx="24" cy="40" rx="20" ry="14" fill="${PAPER}" stroke="${NOTE_COLOR.whole}" stroke-width="5.5"/>`,
    "0 0 48 80",
  ),
} as const;
